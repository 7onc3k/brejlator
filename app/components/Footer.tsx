import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-black text-white py-10">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-between">
                <div className="w-full md:w-1/4 mb-6 md:mb-0">
                  <h3 className="text-lg font-bold mb-4">O nás</h3>
                  <p className="text-sm">
                    Exkluzivní brýle pro moderní ženy a muže.
                  </p>
                </div>
                {footer?.menu && header.shop.primaryDomain?.url && (
                  <div className="w-full md:w-1/4 mb-6 md:mb-0">
                    <h3 className="text-lg font-bold mb-4">Odkazy</h3>
                    <FooterMenu
                      menu={footer.menu}
                      primaryDomainUrl={header.shop.primaryDomain.url}
                      publicStoreDomain={publicStoreDomain}
                    />
                  </div>
                )}
                <div className="w-full md:w-1/4 mb-6 md:mb-0">
                  <h3 className="text-lg font-bold mb-4">Kontakt</h3>
                  <p className="text-sm">Email: info@example.com</p>
                  <p className="text-sm">Telefon: +420 123 456 789</p>
                </div>
                <div className="w-full md:w-1/4">
                  <h3 className="text-lg font-bold mb-4">Newsletter</h3>
                  <form className="flex">
                    <input
                      type="email"
                      placeholder="Váš email"
                      className="bg-white text-black px-3 py-2 w-full"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-4 py-2 ml-2"
                    >
                      Odebírat
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm">
                  &copy; 2023 Váš E-shop. Všechna práva vyhrazena.
                </p>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav role="navigation">
      <ul className="list-none p-0">
        {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
          if (!item.url) return null;
          // if the url is internal, we strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');
          return (
            <li key={item.id} className="mb-2">
              {isExternal ? (
                <a
                  href={url}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-white hover:text-purple-400 transition-colors duration-300"
                >
                  {item.title}
                </a>
              ) : (
                <NavLink
                  end
                  prefetch="intent"
                  to={url}
                  className="text-white hover:text-purple-400 transition-colors duration-300"
                >
                  {item.title}
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
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
    color: isPending ? 'grey' : 'white',
  };
}
