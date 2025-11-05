"use client";

import { Box, Heading, Text, Button } from "@mond-design-system/theme";

export default function Home() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={20}
      style={{ minHeight: "100vh" }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={10}
        style={{ maxWidth: "800px" }}
      >
        <Heading size="4xl" semantic="primary" weight="bold">
          Parroot Website Template
        </Heading>

        <Text size="lg" semantic="secondary" style={{ textAlign: "center" }}>
          A flexible website template built on the Mond Design System with admin
          capabilities for content management and brand customization.
        </Text>

        <Box display="flex" gap={5} marginTop={10}>
          <Button>Get Started</Button>
          <Button>Learn More</Button>
        </Box>
      </Box>
    </Box>
  );
}
