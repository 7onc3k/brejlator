import {Suspense, useState} from 'react';
import {Await, NavLink, Link} from '@remix-run/react';
import {type CartViewPayload, useAnalytics} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {SearchFormPredictive} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <header className="header sticky top-0 bg-white z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button className="hamburger-menu mr-4" onClick={toggleMenu}>
            ☰
          </button>
          <button className="search-toggle mr-4" onClick={toggleSearch}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        <NavLink
          prefetch="intent"
          to="/"
          className="text-2xl font-bold text-black"
        >
          {shop.name}
        </NavLink>
        <div className="flex items-center">
          <NavLink prefetch="intent" to="/account" className="mr-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </NavLink>
          <CartToggle cart={cart} />
        </div>
      </div>
      {isSearchOpen && (
        <div className="search-bar-container">
          <div className="search-bar-wrapper">
            <div className="search-bar">
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
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black"
                    >
                      ✕
                    </button>
                    <SearchResultsPredictive>
                      {({items, total, term, state, inputRef, closeSearch}) => {
                        if (state === 'loading' && term.current) {
                          return <div className="absolute top-full left-0 right-0 bg-white p-2 shadow-md">Načítání...</div>;
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
                                onClick={closeSearch} 
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
        </div>
      )}
      {isMenuOpen && (
        <HeaderMenu
          menu={menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          isLoggedIn={isLoggedIn}
        />
      )}
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  isLoggedIn,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  isLoggedIn: HeaderProps['isLoggedIn'];
}) {
  const className = `header-menu-${viewport}`;

  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    <nav className={className} role="navigation">
      <NavLink
        end
        onClick={closeAside}
        prefetch="intent"
        style={activeLinkStyle}
        to="/"
      >
        Home
      </NavLink>
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={isLoggedIn}>
          {(isLoggedIn) => (
            <NavLink
              className="header-menu-item"
              to={isLoggedIn ? '/account' : '/account/login'}
              prefetch="intent"
            >
              {isLoggedIn ? 'Účet' : 'Přihlásit se'}
            </NavLink>
          )}
        </Await>
      </Suspense>
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas flex items-center" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" className="mx-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </NavLink>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <button
      className="relative"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      {count !== null && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}