# Frontend Quality Guidelines

Inspired by "Impeccable" quality rules.

## 1. Design Hierarchy & Spacing
- Use a predefined spacing scale (Tailwind classes `p-4`, `m-2`). Do not use arbitrary pixel values.
- Maintain a clear visual hierarchy using typography and color contrast.

## 2. Accessibility (a11y)
- Radix UI is mandated for complex interactive components to guarantee ARIA compliance and keyboard navigation.
- All actionable elements must have visible focus states.

## 3. Responsive Design
- Mobile-first approach. Ensure touch targets are at least 44x44px.

## 4. Interaction Patterns
- Avoid blocking the main thread.
- Provide immediate visual feedback for all user actions (spinners, skeletons, toast notifications).
