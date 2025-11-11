import { Box, Heading, Text } from '@mond-design-system/theme';

export default function DashboardPage() {
  return (
    <Box>
      <Heading level={1}>Dashboard</Heading>
      <Text variant="body">Welcome!</Text>
      <Box marginTop="6" className="flex gap-4">
        <Box>
          <Heading level={3}>0</Heading>
          <Text variant="body">Total Users</Text>
        </Box>
        <Box>
          <Heading level={3}>0</Heading>
          <Text variant="body">Total Pages</Text>
        </Box>
        <Box>
          <Heading level={3}>0</Heading>
          <Text variant="body">Total Posts</Text>
        </Box>
      </Box>
    </Box>
  );
}
