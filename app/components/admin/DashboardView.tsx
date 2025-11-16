"use client";

import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
} from "@mond-design-system/theme";
import { useRouter } from "next/navigation";

interface DashboardViewProps {
  hasPostsSegments: boolean;
  hasFormSubmissions: boolean;
}

const ADMIN_SECTIONS = [
  {
    id: "pages",
    label: "Pages",
    description: "Manage your site pages",
    icon: "📄",
    href: "/admin/pages",
    alwaysShow: true,
  },
  {
    id: "segments",
    label: "Segments",
    description: "Create and manage content segments",
    icon: "🧩",
    href: "/admin/segments",
    alwaysShow: true,
  },
  {
    id: "posts",
    label: "Posts",
    description: "Manage posts across all segments",
    icon: "📰",
    href: "/admin/posts",
    alwaysShow: false,
  },
  {
    id: "navigation",
    label: "Site Menu",
    description: "Configure navigation menus",
    icon: "🧭",
    href: "/admin/navigation",
    alwaysShow: true,
  },
  {
    id: "mailbox",
    label: "Mailbox",
    description: "View form submissions",
    icon: "📧",
    href: "/admin/mailbox",
    alwaysShow: false,
  },
  {
    id: "settings",
    label: "Site Settings",
    description: "Configure site settings",
    icon: "⚙️",
    href: "/admin/settings",
    alwaysShow: true,
  },
] as const;

export function DashboardView({
  hasPostsSegments,
  hasFormSubmissions,
}: DashboardViewProps) {
  const router = useRouter();

  // Filter sections based on conditional display
  const visibleSections = ADMIN_SECTIONS.filter((section) => {
    if (section.alwaysShow) return true;
    if (section.id === "posts") return hasPostsSegments;
    if (section.id === "mailbox") return hasFormSubmissions;
    return true;
  });

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <Box display="flex" flexDirection="column" gap="lg">
      <Box>
        <Heading level={1}>Dashboard</Heading>
        <Text variant="body" semantic="secondary">
          Welcome to your admin panel
        </Text>
      </Box>

      <Box
        display="grid"
        gap="lg"
        gridTemplateColumns="repeat(2, minmax(250px, 1fr))"
      >
        {visibleSections.map((section) => (
          <Card key={section.id}>
            <CardBody>
              <Box display="flex" flexDirection="column" gap="xs">
                <Box display="flex" alignItems="center" gap="sm">
                  <Text variant="title">{section.icon}</Text>
                  <Heading level={3}>{section.label}</Heading>
                </Box>
                <Text variant="body" semantic="secondary">
                  {section.description}
                </Text>
                <Box>
                  <Button
                    variant="primary"
                    onClick={() => handleNavigate(section.href)}
                  >
                    Go to {section.label}
                  </Button>
                </Box>
              </Box>
            </CardBody>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
