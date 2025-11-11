import { unstable_noStore as noStore } from 'next/cache';
import { Box, Heading, Text, Button } from "@mond-design-system/theme";
import { Header } from "./components/Header";
import { getMenuItems } from "./utils/firestore-navigation";
import { getPages } from "./utils/firestore-pages";
import { getUser } from "./lib/dal";
import { getSiteSettings } from "./utils/firestore-settings";

export default async function Home() {
  // Opt out of caching for this request
  noStore();

  // Fetch navigation data, user, and settings for header
  const [menuItems, pages, user, settings] = await Promise.all([
    getMenuItems({ visible: true }),
    getPages({ status: 'published' }),
    getUser(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header
        menuItems={menuItems}
        pages={pages}
        user={user}
        siteName={settings?.siteName}
        logoUrl={settings?.logoUrl}
      />
      <Box
        as="main"
        padding="20"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        className="min-h-screen"
      >
        <Box display="flex" flexDirection="column" alignItems="center" className="max-w-3xl" padding="10">
          <Heading level={1} size="4xl" semantic="primary" weight="bold">
            Parroot Website Template
          </Heading>

          <Box marginTop="6" marginBottom="10">
            <Text variant="body" semantic="secondary" align="center">
              A flexible website template built on the Mond Design System with admin
              capabilities for content management and brand customization.
            </Text>
          </Box>

          <Box display="flex" gap="md">
            <Button variant="primary">Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
