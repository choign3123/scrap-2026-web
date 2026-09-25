import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import folderIcon from '../../assets/icons/folder.svg';
import scrapIcon from '../../assets/icons/scrap-clip.svg';
import sidebarOpenIcon from '../../assets/icons/expand-right-double.svg';
import starFillIcon from '../../assets/icons/star-fill.svg';
import starOutlineIcon from '../../assets/icons/star-outline.svg';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import CategorySelect from '../../components/scrap/CategorySelect/CategorySelect';
import MarkdownEditor from '../../components/scrap/MarkdownEditor/MarkdownEditor';
import { useCreateScrapMutation } from '../../hooks/mutations/useScrapMutations';
import { useCategoriesQuery } from '../../hooks/queries/useCategoriesQuery';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getUrlMetadata } from '../../services/api/urlMetadataService';
import type { UrlMetadataDTO } from '../../types/api/urlMetadata';
import { toApiError } from '../../utils/apiError';
import styles from './ScrapCreatePage.module.css';

type MetadataStatus = 'idle' | 'loading' | 'success' | 'fallback' | 'default';

const EMPTY_METADATA: UrlMetadataDTO = {
  title: '제목 없음',
  description: '',
  imageURL: null,
};

/** 외부 페이지 조회가 가능한 HTTP(S) URL일 때만 정규화한 주소를 반환합니다. */
function getFetchableURL(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

/** URL 입력, OG 미리보기, 메모와 즐겨찾기를 한 번에 저장하는 화면입니다. */
function ScrapCreatePage() {
  const navigate = useNavigate();
  useDocumentTitle('스크랩 추가 | 스크랩');
  const [searchParams] = useSearchParams();
  const requestedCategoryId = Number(searchParams.get('category')) || null;
  const categoriesQuery = useCategoriesQuery();
  const createScrapMutation = useCreateScrapMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches,
  );
  const [categoryId, setCategoryId] = useState<number | null>(requestedCategoryId);
  const [scrapURL, setScrapURL] = useState('');
  const [memo, setMemo] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [metadata, setMetadata] = useState<UrlMetadataDTO>(EMPTY_METADATA);
  const [title, setTitle] = useState(EMPTY_METADATA.title);
  const [metadataStatus, setMetadataStatus] = useState<MetadataStatus>('idle');
  const [hasImageError, setHasImageError] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const metadataRequestIdRef = useRef(0);
  const fetchableURL = useMemo(() => getFetchableURL(scrapURL), [scrapURL]);
  const trimmedScrapURL = scrapURL.trim();

  useEffect(() => {
    if (!categoriesQuery.data) {
      return;
    }

    // 쿼리의 카테고리가 실제 목록에 없으면 서버가 알려준 기본 카테고리를 선택합니다.
    const requestedCategoryExists = categoriesQuery.data.categories.some(
      (category) => category.categoryId === requestedCategoryId,
    );
    const defaultCategory = categoriesQuery.data.categories.find(
      (category) => category.isDefault,
    );

    if (requestedCategoryExists && requestedCategoryId) {
      setCategoryId(requestedCategoryId);
    } else if (defaultCategory) {
      setCategoryId(defaultCategory.categoryId);
    } else {
      setCategoryId(categoriesQuery.data.categories[0]?.categoryId ?? null);
    }
  }, [categoriesQuery.data, requestedCategoryId]);

  useEffect(() => {
    const requestId = metadataRequestIdRef.current + 1;
    metadataRequestIdRef.current = requestId;
    setMetadata(EMPTY_METADATA);
    setTitle(EMPTY_METADATA.title);
    setHasImageError(false);

    if (!trimmedScrapURL) {
      setMetadataStatus('idle');
      return;
    }

    // URL 형식이 아닌 문자열은 외부 요청 없이 메모용 기본 스크랩 정보로 표시합니다.
    if (!fetchableURL) {
      setMetadataStatus('default');
      return;
    }

    setMetadataStatus('loading');
    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const parsedMetadata = await getUrlMetadata(
          fetchableURL,
          abortController.signal,
        );
        if (metadataRequestIdRef.current !== requestId) {
          return;
        }

        // 서버가 일부 필드를 null로 반환해도 화면과 저장 요청에는 안전한 기본값을 사용합니다.
        const nextMetadata: UrlMetadataDTO = {
          title: parsedMetadata.title?.trim() || '제목 없음',
          description: parsedMetadata.description ?? '',
          imageURL: parsedMetadata.imageURL || null,
        };
        setMetadata(nextMetadata);
        setTitle(nextMetadata.title);
        setMetadataStatus('success');
      } catch {
        if (metadataRequestIdRef.current !== requestId) {
          return;
        }

        // 백엔드 파싱이 실패해도 기본 정보와 사용자가 수정한 제목으로 저장할 수 있습니다.
        setMetadata(EMPTY_METADATA);
        setTitle(EMPTY_METADATA.title);
        setMetadataStatus('fallback');
      }
    }, 650);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [fetchableURL, trimmedScrapURL]);

  function navigateToDashboard(targetCategoryId: number | null = categoryId) {
    const destination = targetCategoryId
      ? `/dashboard?category=${targetCategoryId}`
      : '/dashboard';
    navigate(destination);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    setSaveError(null);

    if (!trimmedScrapURL || categoryId === null) {
      return;
    }

    try {
      await createScrapMutation.mutateAsync({
        categoryId,
        requestBody: {
          // URL 형식이 아니더라도 사용자가 입력한 메모용 문자열을 그대로 저장합니다.
          scrapURL: trimmedScrapURL,
          imageURL: metadata.imageURL,
          title: title?.trim() || '제목 없음',
          description: metadata.description || '',
          memo,
          isFavorite,
        },
      });
      navigateToDashboard(categoryId);
    } catch (error) {
      setSaveError(toApiError(error).message);
    }
  }

  const categories = categoriesQuery.data?.categories ?? [];
  const selectedCategoryTitle = categories.find(
    (category) => category.categoryId === categoryId,
  )?.categoryTitle;

  return (
    <main className={styles.page}>
      {isSidebarOpen && (
        <div className={styles.sidebarLayer}>
          <Sidebar
            selectedCategoryId={categoryId}
            isFavoritesSelected={false}
            onSelectCategory={(nextCategoryId) => navigateToDashboard(nextCategoryId)}
            onSelectFavorites={() => navigate('/dashboard?view=favorites')}
            onCollapse={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {isSidebarOpen && (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="사이드바 닫기"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <section className={styles.content} aria-labelledby="create-scrap-title">
        <header className={styles.header}>
          <div className={styles.headerStart}>
            {!isSidebarOpen && (
              <button
                type="button"
                className={styles.iconButton}
                aria-label="사이드바 열기"
                onClick={() => setIsSidebarOpen(true)}
              >
                <img src={sidebarOpenIcon} alt="" />
              </button>
            )}
            <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
              <span aria-hidden="true">←</span>
              돌아가기
            </button>
          </div>
          <div className={styles.headerTitle}>
            <span>새로운 링크 저장</span>
            <h1 id="create-scrap-title">스크랩 추가</h1>
          </div>
          <span className={styles.headerBalance} aria-hidden="true" />
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formBody}>
            <section className={styles.urlSection}>
              <div className={styles.sectionHeading}>
                <div className={styles.stepNumber}>1</div>
                <div>
                  <h2>저장할 링크를 입력하세요</h2>
                  <p>주소를 확인한 뒤 제목과 대표 이미지를 자동으로 가져옵니다.</p>
                </div>
              </div>

              <label className={styles.urlField}>
                <span>URL</span>
                <input
                  type="text"
                  inputMode="url"
                  value={scrapURL}
                  placeholder="https://example.com/article"
                  autoFocus
                  onChange={(event) => {
                    setScrapURL(event.target.value);
                    setHasSubmitted(false);
                    setSaveError(null);
                  }}
                />
                {metadataStatus === 'loading' && (
                  <span className={styles.fieldLoader} aria-label="링크 정보 불러오는 중" />
                )}
              </label>

              {hasSubmitted && !trimmedScrapURL && (
                <p className={styles.fieldError} role="alert">
                  저장할 URL 또는 메모용 문자열을 입력해 주세요.
                </p>
              )}
              {metadataStatus === 'success' && (
                <p className={styles.metadataSuccess}>링크 정보를 불러왔습니다.</p>
              )}
              {metadataStatus === 'fallback' && (
                <p className={styles.metadataWarning} role="status">
                  링크 정보를 분석하지 못했습니다. 제목을 직접 입력해 저장할 수 있습니다.
                </p>
              )}
              {metadataStatus === 'default' && (
                <p className={styles.metadataDefault} role="status">
                  URL 형식이 아니므로 외부 조회 없이 기본 정보로 저장합니다.
                </p>
              )}
            </section>

            <section className={styles.previewSection}>
              <div className={styles.sectionHeading}>
                <div className={styles.stepNumber}>2</div>
                <div>
                  <h2>링크 미리보기</h2>
                  <p>자동으로 수집된 정보는 저장 후 원문을 구분하는 데 사용됩니다.</p>
                </div>
              </div>

              <div className={styles.previewCard} aria-busy={metadataStatus === 'loading'}>
                <div className={styles.previewImage}>
                  {metadata.imageURL && !hasImageError ? (
                    <img
                      src={metadata.imageURL}
                      alt=""
                      // 네이버 등 외부 삽입을 제한하는 이미지 서버에 현재 웹 주소를 전달하지 않습니다.
                      referrerPolicy="no-referrer"
                      onError={() => setHasImageError(true)}
                    />
                  ) : (
                    <span>
                      <img src={scrapIcon} alt="" />
                      {metadataStatus === 'loading'
                        ? '미리보기를 만드는 중입니다'
                        : '대표 이미지가 없습니다'}
                    </span>
                  )}
                </div>
                <div className={styles.previewInformation}>
                  <label className={styles.titleField}>
                    <span className={styles.previewLabel}>
                      제목 <em>직접 수정 가능</em>
                    </span>
                    <input
                      type="text"
                      value={title ?? ''}
                      placeholder="스크랩 제목을 입력해 주세요"
                      disabled={metadataStatus === 'loading'}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                  </label>
                  <span className={styles.previewLabel}>설명</span>
                  <p>{metadata.description || '등록된 설명이 없습니다.'}</p>
                  <small>
                    {trimmedScrapURL || 'URL이나 메모를 입력하면 저장 정보가 표시됩니다.'}
                  </small>
                </div>
              </div>
            </section>

            <section className={styles.optionSection}>
              <div className={styles.sectionHeading}>
                <div className={styles.stepNumber}>3</div>
                <div>
                  <h2>저장 옵션</h2>
                  <p>카테고리, 즐겨찾기와 나중에 확인할 메모를 설정하세요.</p>
                </div>
              </div>

              <div className={styles.optionGrid}>
                <label className={styles.categoryField}>
                  <span>
                    <img src={folderIcon} alt="" />
                    카테고리
                  </span>
                  <CategorySelect
                    categories={categories}
                    value={categoryId}
                    disabled={categoriesQuery.isLoading || categoriesQuery.isError}
                    onChange={setCategoryId}
                  />
                </label>

                <button
                  type="button"
                  className={`${styles.favoriteToggle} ${isFavorite ? styles.active : ''}`}
                  aria-pressed={isFavorite}
                  onClick={() => setIsFavorite((current) => !current)}
                >
                  <img src={isFavorite ? starFillIcon : starOutlineIcon} alt="" />
                  <span>
                    <strong>즐겨찾기</strong>
                    <small>{isFavorite ? '즐겨찾기에 표시됩니다.' : '필요할 때 빠르게 찾을 수 있어요.'}</small>
                  </span>
                  <i aria-hidden="true" />
                </button>
              </div>

              {categoriesQuery.isError && (
                <div className={styles.categoryError} role="alert">
                  <span>카테고리를 불러오지 못했습니다.</span>
                  <button type="button" onClick={() => categoriesQuery.refetch()}>
                    다시 시도
                  </button>
                </div>
              )}

              <div className={styles.memoField}>
                <div>
                  <span>메모</span>
                </div>
                <MarkdownEditor initialMarkdown="" onChange={setMemo} />
              </div>
            </section>

            {saveError && (
              <p className={styles.saveError} role="alert">
                {saveError}
              </p>
            )}
          </div>

          <div className={styles.actionBar}>
            <div>
              <span>저장 위치</span>
              <strong>{selectedCategoryTitle ?? '카테고리를 선택해 주세요'}</strong>
            </div>
            <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>
              취소
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={
                createScrapMutation.isPending ||
                categoriesQuery.isLoading ||
                categoryId === null
              }
            >
              {createScrapMutation.isPending ? '저장 중...' : '스크랩 저장'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default ScrapCreatePage;
