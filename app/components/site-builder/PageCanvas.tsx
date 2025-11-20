"use client";

import {
  Box,
  Text,
  Heading,
  Card,
  Button,
  Spinner,
} from "@mond-design-system/theme";
import { DropZone, DropZoneItem } from "@mond-design-system/theme/client";
import { useSiteBuilder } from "@/app/contexts/SiteBuilderContext";
import {
  usePage,
  useSegment,
} from "@/app/hooks/useSiteBuilderData";
import { usePageEditor } from "@/app/(admin)/admin/site-builder/page";

export function PageCanvas() {
  const { selectedPageId, openSegmentDrawer } = useSiteBuilder();
  const { data: page, isLoading: pageLoading } = usePage(selectedPageId);

  const {
    stagedHeaderId,
    stagedMainId,
    stagedFooterId,
    setStagedHeaderId,
    setStagedMainId,
    setStagedFooterId,
  } = usePageEditor();

  // Fetch segments using staged IDs
  const { data: headerSegment } = useSegment(stagedHeaderId);
  const { data: mainSegment } = useSegment(stagedMainId);
  const { data: footerSegment } = useSegment(stagedFooterId);

  const handleRemoveHeader = () => {
    setStagedHeaderId(null);
  };

  const handleRemoveMain = () => {
    setStagedMainId(null);
  };

  const handleRemoveFooter = () => {
    setStagedFooterId(null);
  };

  if (!selectedPageId) {
    return (
      <Box
        padding="20"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box>
          <Heading level={3} size="lg">
            No page selected
          </Heading>
          <Text variant="body" semantic="secondary">
            Select a page from the navigation or create a new one
          </Text>
        </Box>
      </Box>
    );
  }

  if (pageLoading) {
    return (
      <Box
        padding="20"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!page) {
    return (
      <Box
        padding="20"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text>Page not found</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="md" width="full">
      <Box display="flex" border="subtle" justifyContent="center">
        <Heading level={2} size="xl">
          {page.title}
        </Heading>
      </Box>

      <Box>
        <DropZone id="header-zone" placeholder="Drop a segment here">
          {headerSegment && (
            <DropZoneItem
              id={headerSegment.id}
              type="segment"
              onRemove={handleRemoveHeader}
            >
              <Card>
                <Box
                  padding="4"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Heading level={5} size="sm">
                      {headerSegment.name}
                    </Heading>
                    <Text variant="body" semantic="secondary">
                      {headerSegment.type}
                    </Text>
                  </Box>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openSegmentDrawer(headerSegment.id)}
                  >
                    Edit
                  </Button>
                </Box>
              </Card>
            </DropZoneItem>
          )}
        </DropZone>
      </Box>

      <Box>
        <DropZone id="main-zone" placeholder="Drop a segment here">
          {mainSegment && (
            <DropZoneItem
              id={mainSegment.id}
              type="segment"
              onRemove={handleRemoveMain}
            >
              <Card>
                <Box
                  padding="4"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Heading level={5} size="sm">
                      {mainSegment.name}
                    </Heading>
                    <Text variant="body" semantic="secondary">
                      {mainSegment.type}
                    </Text>
                  </Box>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openSegmentDrawer(mainSegment.id)}
                  >
                    Edit
                  </Button>
                </Box>
              </Card>
            </DropZoneItem>
          )}
        </DropZone>
      </Box>

      <Box>
        <DropZone id="footer-zone" placeholder="Drop a segment here">
          {footerSegment && (
            <DropZoneItem
              id={footerSegment.id}
              type="segment"
              onRemove={handleRemoveFooter}
            >
              <Card>
                <Box
                  padding="4"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Heading level={5} size="sm">
                      {footerSegment.name}
                    </Heading>
                    <Text variant="body" semantic="secondary">
                      {footerSegment.type}
                    </Text>
                  </Box>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openSegmentDrawer(footerSegment.id)}
                  >
                    Edit
                  </Button>
                </Box>
              </Card>
            </DropZoneItem>
          )}
        </DropZone>
      </Box>
    </Box>
  );
}
