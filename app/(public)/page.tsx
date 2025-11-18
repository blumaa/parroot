import { redirect } from 'next/navigation';
import { Box, Heading, Text } from "@mond-design-system/theme";
import { getMenuItems, getPages } from '@/app/lib/data-access';

export default async function Home() {
  // Get the first visible menu item
  const menuItems = await getMenuItems({ visible: true });
  const pages = await getPages({ status: 'published' });

  // If there's a visible menu item, redirect to its page
  if (menuItems.length > 0 && menuItems[0].pageId) {
    const firstPage = pages.find(p => p.id === menuItems[0].pageId);
    if (firstPage) {
      redirect(`/${firstPage.slug}`);
    }
  }

  // Otherwise show empty state
  return (
    <Box
      as="main"
      padding="20"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className="min-h-screen"
    >
      <Box display="flex" flexDirection="column" alignItems="center" className="max-w-2xl" padding="10">
        <Heading level={1} size="3xl" semantic="secondary">
          No pages created yet
        </Heading>

        <Box marginTop="6">
          <Text variant="body" semantic="secondary" align="center">
            Please create your first page in the admin panel to get started.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
