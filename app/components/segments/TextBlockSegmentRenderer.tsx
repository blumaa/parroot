import { Box, Heading } from '@mond-design-system/theme';
import '@/app/styles/tiptap-content.css';

interface TextBlockSegmentRendererProps {
  content: {
    heading?: string;
    headingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    headingWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    body?: string;
    alignment?: 'left' | 'center' | 'right';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
}

const PADDING_MAP = {
  none: '0',
  sm: '2',
  md: '4',
  lg: '6',
  xl: '8',
} as const;

export function TextBlockSegmentRenderer({ content }: TextBlockSegmentRendererProps) {
  const {
    heading,
    headingSize = 'lg',
    headingWeight = 'bold',
    body,
    alignment = 'left',
    padding = 'md',
  } = content;

  const paddingValue = PADDING_MAP[padding];

  return (
    <Box padding={paddingValue}>
      {heading && (
        <Heading
          level={2}
          size={headingSize}
          weight={headingWeight}
          align={alignment}
        >
          {heading}
        </Heading>
      )}
      {body && (
        <Box
          marginTop={heading ? '3' : '0'}
          dangerouslySetInnerHTML={{ __html: body }}
          className="tiptap-content"
        />
      )}
    </Box>
  );
}
