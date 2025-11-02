/**
 * Shared navigation configuration for NavBar and Footer
 * Defines routes and their audience/role requirements
 */

export type Audience = 'any' | 'guest' | 'customer' | 'trader';

export interface NavItem {
  label: string;
  href: string;
  audience: Audience;
}

export interface FooterGroup {
  title: string;
  items: NavItem[];
}

/**
 * Footer navigation groups
 * Note: "Chat" is only shown when user is logged in AND has conversations (handled separately)
 */
export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: 'JobHub',
    items: [
      { label: 'Home', href: '/', audience: 'any' },
      { label: 'How It Works', href: '/#how-it-works', audience: 'any' },
      // Add About/Contact here if they exist in your app
      // { label: 'About', href: '/about', audience: 'any' },
      // { label: 'Contact', href: '/contact', audience: 'any' },
    ],
  },
  {
    title: 'For Homeowners',
    items: [
      { label: 'Post a Job', href: '/post-job', audience: 'any' },
      { label: 'My Projects', href: '/homeowner/my-projects', audience: 'customer' },
      { label: 'Chat', href: '/chat', audience: 'customer' },
    ],
  },
  {
    title: 'For Tradespeople',
    items: [
      { label: 'Jobs', href: '/tradesperson/jobs', audience: 'trader' },
      { label: 'My Profile', href: '/tradesperson/profile', audience: 'trader' },
      { label: 'Join as a Tradesperson', href: '/tradesperson/onboarding', audience: 'guest' },
      { label: 'Chat', href: '/chat', audience: 'trader' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', href: '/privacy', audience: 'any' },
      { label: 'Terms of Service', href: '/terms', audience: 'any' },
      { label: 'Cookie Settings', href: '#cookie-settings', audience: 'any' },
    ],
  },
];

/**
 * User authentication and role information
 */
export interface AuthUser {
  id: string;
  role: string | string[]; // Can be string or array of roles
  [key: string]: any;
}

/**
 * Determines if a user can see a navigation item based on audience requirements
 * Mirrors the logic from Navbar.tsx
 * 
 * @param audience - Target audience for the nav item
 * @param user - Current authenticated user (null if not logged in)
 * @param hasChats - Whether the user has any chat conversations (for chat links)
 * @returns true if the user can see this nav item
 */
export function canSee(
  audience: Audience,
  user: AuthUser | null,
  hasChats: boolean = false
): boolean {
  const isLoggedIn = !!user;

  // Check if user is a customer (homeowner)
  const isCustomer = user
    ? Array.isArray(user.role)
      ? user.role.includes('customer')
      : user.role === 'customer' || user.role === 'USER'
    : false;

  // Check if user is a trader
  const isTrader = user
    ? Array.isArray(user.role)
      ? user.role.includes('trader')
      : user.role === 'trader'
    : false;

  // Check if user has trader role (to hide "Join as Tradesperson")
  const hasTraderRole = user
    ? Array.isArray(user.role)
      ? user.role.includes('trader')
      : user.role === 'trader'
    : false;

  switch (audience) {
    case 'any':
      return true;

    case 'guest':
      // Show to guests OR logged-in users without trader role
      return !isLoggedIn || !hasTraderRole;

    case 'customer':
      return isLoggedIn && isCustomer;

    case 'trader':
      return isLoggedIn && isTrader;

    default:
      return false;
  }
}

/**
 * Filters navigation items based on user auth state and role
 * 
 * @param items - Array of navigation items to filter
 * @param user - Current authenticated user
 * @param hasChats - Whether user has chat conversations
 * @returns Filtered array of nav items the user can access
 */
export function filterNavItems(
  items: NavItem[],
  user: AuthUser | null,
  hasChats: boolean = false
): NavItem[] {
  return items.filter((item) => {
    // Special handling for Chat links - only show if user has conversations
    if (item.href === '/chat') {
      return canSee(item.audience, user, hasChats) && hasChats;
    }
    return canSee(item.audience, user, hasChats);
  });
}

/**
 * Filters footer groups and removes empty groups after filtering items
 * 
 * @param groups - Array of footer groups
 * @param user - Current authenticated user
 * @param hasChats - Whether user has chat conversations
 * @returns Filtered footer groups with only visible items
 */
export function filterFooterGroups(
  groups: FooterGroup[],
  user: AuthUser | null,
  hasChats: boolean = false
): FooterGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, user, hasChats),
    }))
    .filter((group) => group.items.length > 0); // Remove empty groups
}
