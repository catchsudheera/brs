import { Fragment, useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { capitalizeFirstLetter } from '@/utils/string';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePlayers } from '@/hooks/usePlayers';
import Image from 'next/image';
import { useLiveGames } from '@/hooks/useLiveGames';

// Add build identifier from env
const BUILD_IDENTIFIER = process.env.NEXT_PUBLIC_BUILD_IDENTIFIER;

const navigation = [
  { name: 'Ranking', href: '/' },
  { name: 'Encounters', href: '#' },
  { name: 'History', href: '/player-ranking-history' },
  { name: 'Encounter History', href: '/encounter-history' },
];

function classNames(...classes: (string | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface LiveGame {
  id: string;
  progress: number;
  createdAt: string;
}

const NavigationComponent = () => {
  const router = useRouter();
  const { players, isLoading } = usePlayers();
  const [theme, setTheme] = useState('emerald');
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const { liveGames, isLoading: liveGamesLoading } = useLiveGames();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'emerald' ? 'dark' : 'emerald');
  };

  const isEncountersPage = () => {
    return router.pathname.includes('/player') && router.pathname.includes('/encounters');
  };

  const renderPlayersList = () => {
    if (isLoading) return null;

    return players
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((player) => (
        <Menu.Item key={player.id}>
          {({ active }) => (
            <Link
              href={`/player/${player.id}/encounters`}
              className={classNames(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'block px-4 py-2 text-sm hover:text-emerald-600 transition-colors duration-150'
              )}
            >
              {capitalizeFirstLetter(player.name)}
            </Link>
          )}
        </Menu.Item>
      ));
  };

  return (
    <>
      {/* Placeholder div to prevent content jump when nav becomes fixed */}
      <div className={`h-16 ${isScrolled ? 'block' : 'hidden'}`} />

      <Disclosure as='nav'
        className={`${isScrolled
            ? 'fixed top-0 left-0 right-0 animate-slideDown z-[100]'
            : 'relative z-[100]'
          } bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg`}
      >
        {({ open }) => (
          <>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
              <div className='relative flex items-center justify-between h-16'>
                {/* Mobile menu button */}
                <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
                  <Disclosure.Button className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition duration-150'>
                    <span className='sr-only'>Open main menu</span>
                    {open ? (
                      <XMarkIcon className='block h-6 w-6' aria-hidden='true' />
                    ) : (
                      <Bars3Icon className='block h-6 w-6' aria-hidden='true' />
                    )}
                  </Disclosure.Button>
                </div>

                {/* Logo and brand */}
                <div className='flex-1 flex items-center justify-center sm:items-stretch sm:justify-start'>
                  <Link href='/' className='flex-shrink-0 flex items-center'>
                    <Image
                      src={`/dutch-lankan-shuttle-masters-logo.jpeg?v=${BUILD_IDENTIFIER}`}
                      alt="Dutch Lankan Shuttle Masters"
                      width={40}
                      height={40}
                      className="h-10 w-auto"
                      priority
                    />
                    <div className='text-xl font-bold text-white ml-4 tracking-tight'>
                      Dutch Lankan Shuttle Masters
                    </div>
                  </Link>

                  {/* Desktop navigation */}
                  <div className='hidden sm:flex sm:ml-6 sm:items-center sm:justify-between flex-1'>
                    {/* Left side navigation items */}
                    <div className="flex items-center space-x-4">
                      <Link
                        href={navigation[0].href}
                        className={classNames(
                          router.pathname === navigation[0].href
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150'
                        )}
                      >
                        {navigation[0].name}
                      </Link>

                      {/* Player Encounters Dropdown */}
                      <Menu as="div" className="relative">
                        <Menu.Button
                          className={classNames(
                            isEncountersPage()
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 inline-flex items-center'
                          )}
                        >
                          Encounters
                          <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 max-h-96 overflow-y-auto z-[60]">
                            <div className="py-1">
                              {renderPlayersList()}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>

                      {/* Live Games Dropdown */}
                      <Menu as="div" className="relative">
                        <Menu.Button
                          className={classNames(
                            'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 inline-flex items-center',
                            liveGames.length > 0 && 'relative animate-glow bg-red-500/10'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {liveGames.length > 0 && (
                              <span className="animate-pulse bg-red-500 w-2 h-2 rounded-full"></span>
                            )}
                            Live
                            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              {liveGamesLoading ? (
                                <div className="text-center py-2">
                                  <span className="loading loading-spinner loading-sm"></span>
                                </div>
                              ) : liveGames.length > 0 ? (
                                liveGames.map((game) => (
                                  <Menu.Item key={game.id}>
                                    {({ active }) => (
                                      <Link
                                        href={`/game-viewer?gameId=${game.id}`}
                                        className={classNames(
                                          active ? 'bg-gray-100' : '',
                                          'block px-4 py-2 text-sm text-gray-700'
                                        )}
                                      >
                                        <div className="w-full">
                                          <div className="flex justify-between items-center mb-1">
                                            <span>Game #{game.id.slice(-4)}</span>
                                            <span className="text-sm opacity-70">
                                              {game.progress}%
                                            </span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                                              style={{ width: `${game.progress}%` }}
                                            />
                                          </div>
                                        </div>
                                      </Link>
                                    )}
                                  </Menu.Item>
                                ))
                              ) : (
                                <div className="text-center py-2 text-gray-500">
                                  No live games
                                </div>
                              )}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>

                      {/* Remaining navigation items */}
                      {navigation.slice(2).map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            router.pathname === item.href
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150'
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>

                    {/* Right side items */}
                    <div className="flex items-center space-x-4">
                      {session ? (
                        <Link
                          href="/admin/dashboard"
                          className="bg-gray-700 text-white hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                        >
                          Admin
                        </Link>
                      ) : (
                        <Link
                          href="/admin/login"
                          className="bg-gray-700 text-white hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                        >
                          Login
                        </Link>
                      )}

                      <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150"
                        title={`Switch to ${theme === 'emerald' ? 'dark' : 'light'} mode`}
                      >
                        {theme === 'emerald' ? (
                          <svg
                            className='swap-on fill-current w-6 h-6'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                          >
                            <path d='M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z' />
                          </svg>
                        ) : (
                          <svg
                            className='swap-off fill-current w-6 h-6'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                          >
                            <path d='M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z' />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu panel */}
            <Disclosure.Panel className='sm:hidden fixed top-16 left-0 right-0 bottom-0 bg-gray-800 overflow-y-auto z-[90]'>
              {({ close }) => (
                <div className='px-2 pt-2 pb-3 space-y-1'>
                  <Disclosure.Button
                    as={Link}
                    href={navigation[0].href}
                    className={classNames(
                      router.pathname === navigation[0].href
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block px-3 py-2 rounded-md text-base font-medium'
                    )}
                  >
                    {navigation[0].name}
                  </Disclosure.Button>

                  {/* Mobile Player Encounters Submenu */}
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={classNames(
                            isEncountersPage()
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'flex w-full justify-between px-3 py-2 text-base font-medium rounded-md'
                          )}
                        >
                          <span>Encounters</span>
                          <ChevronDownIcon
                            className={`${open ? 'transform rotate-180' : ''
                              } w-5 h-5 text-gray-400`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="px-4 pt-2 pb-2 space-y-1">
                          {players
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((player) => (
                              <Link
                                key={player.id}
                                href={`/player/${player.id}/encounters`}
                                className="block px-3 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                                onClick={() => close()}
                              >
                                {capitalizeFirstLetter(player.name)}
                              </Link>
                            ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>

                  {/* Live Games Section */}
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={classNames(
                            'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'flex w-full justify-between px-3 py-2 text-base font-medium rounded-md',
                            liveGames.length > 0 && 'relative animate-glow bg-red-500/10'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {liveGames.length > 0 && (
                              <span className="animate-pulse bg-red-500 w-2 h-2 rounded-full"></span>
                            )}
                            <span>Live</span>
                          </div>
                          <ChevronDownIcon
                            className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-gray-400`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="px-4 pt-2 pb-2 space-y-1">
                          {liveGamesLoading ? (
                            <div className="text-center py-2">
                              <span className="loading loading-spinner loading-sm"></span>
                            </div>
                          ) : liveGames.length > 0 ? (
                            liveGames.map((game) => (
                              <Link
                                key={game.id}
                                href={`/game-viewer?gameId=${game.id}`}
                                className="block px-3 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                              >
                                <div className="w-full">
                                  <div className="flex justify-between items-center mb-1">
                                    <span>Game #{game.id.slice(-4)}</span>
                                    <span className="text-sm opacity-70">
                                      {game.progress}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div 
                                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                                      style={{ width: `${game.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="text-center py-2 text-gray-500">
                              No live games
                            </div>
                          )}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>

                  {/* Remaining navigation items */}
                  {navigation.slice(2).map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={classNames(
                        router.pathname === item.href
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'block px-3 py-2 rounded-md text-base font-medium'
                      )}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}

                  {/* Theme Switcher for Mobile */}
                  <div className="px-3 py-2 flex items-center justify-between text-gray-300">
                    <span className="text-base font-medium">Theme</span>
                    <button
                      onClick={() => {
                        toggleTheme();
                        close();
                      }}
                      className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150"
                      title={`Switch to ${theme === 'emerald' ? 'dark' : 'light'} mode`}
                    >
                      {theme === 'emerald' ? (
                        <svg
                          className='swap-on fill-current w-6 h-6'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                        >
                          <path d='M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z' />
                        </svg>
                      ) : (
                        <svg
                          className='swap-off fill-current w-6 h-6'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                        >
                          <path d='M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z' />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Login/Admin button remains at the bottom */}
                  {session ? (
                    <Disclosure.Button
                      as={Link}
                      href="/admin/dashboard"
                      className="bg-gray-700 text-white hover:bg-gray-600 block px-3 py-2 rounded-md text-base font-medium"
                    >
                      Admin
                    </Disclosure.Button>
                  ) : (
                    <Disclosure.Button
                      as={Link}
                      href="/admin/login"
                      className="bg-gray-700 text-white hover:bg-gray-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      Login
                    </Disclosure.Button>
                  )}

                  {/* Add build identifier for mobile */}
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Build: {BUILD_IDENTIFIER}
                  </div>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  );
};

export default NavigationComponent;
