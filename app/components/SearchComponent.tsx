import {SearchFormPredictive} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {Link} from '@remix-run/react';

interface SearchComponentProps {
  onClose: () => void;
}

export function SearchComponent({onClose}: SearchComponentProps) {
  return (
    <div className="search-overlay fixed top-[60px] left-0 right-0 bottom-0 bg-white z-20 overflow-y-auto">
      <div className="container mx-auto px-4 py-4">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="relative">
              <input
                ref={inputRef}
                onChange={fetchResults}
                onFocus={fetchResults}
                type="search"
                placeholder="Hledat..."
                className="w-full px-4 py-2 pr-10 border-none border-b-2 border-gray-300 focus:border-purple-600 outline-none transition-colors duration-300"
              />
              <SearchResultsPredictive>
                {({items, total, term, state, inputRef, closeSearch}) => {
                  if (state === 'loading' && term.current) {
                    return (
                      <div className="absolute top-full left-0 right-0 bg-white p-2 shadow-md">
                        Načítání...
                      </div>
                    );
                  }

                  if (!total) {
                    return null;
                  }

                  return (
                    <div className="absolute top-full left-0 right-0 bg-white shadow-md z-10">
                      <SearchResultsPredictive.Queries
                        queries={items.queries}
                        term={term}
                        inputRef={inputRef}
                      />
                      <SearchResultsPredictive.Products
                        products={items.products}
                        closeSearch={closeSearch}
                        term={term}
                      />
                      <SearchResultsPredictive.Collections
                        collections={items.collections}
                        closeSearch={closeSearch}
                        term={term}
                      />
                      <SearchResultsPredictive.Pages
                        pages={items.pages}
                        closeSearch={closeSearch}
                        term={term}
                      />
                      <SearchResultsPredictive.Articles
                        articles={items.articles}
                        closeSearch={closeSearch}
                        term={term}
                      />
                      {term.current && total > 0 && (
                        <Link
                          onClick={() => {
                            closeSearch();
                            onClose();
                          }}
                          to={`/search?q=${term.current}`}
                          className="block p-2 text-sm text-gray-600 hover:bg-gray-100"
                        >
                          Zobrazit všechny výsledky pro <q>{term.current}</q> →
                        </Link>
                      )}
                    </div>
                  );
                }}
              </SearchResultsPredictive>
            </div>
          )}
        </SearchFormPredictive>
      </div>
    </div>
  );
}