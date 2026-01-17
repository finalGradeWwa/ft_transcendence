# Major 
## Complete accessibility compliance (WCAG 2.1 AA) with screen reader
### 1. Skip Link 
	support, keyboard navigation, and assistive technologies.
	Accessibility: Skip-to-Content Implementation
	To comply with WCAG 2.1 AA standards, a Skip Link was implemented to enhance keyboard navigation.

	Purpose: Allows keyboard and screen reader users to bypass repetitive navigation links and jump directly to the primary content (#main-content).

	Behavior: The link is visually hidden by default and becomes visible only when it receives focus via the Tab key.

	Impact: Significantly reduces navigation time and improves the overall User Experience (UX) for users with motor or visual impairments.

--------------------

# Minor: 
## Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components).

### 1. Typography:
	components/typography/Text.tsx
	A Text component with multiple variants (body, small, caption, muted) 
	and flexible HTML elements (p, span, div).

### 2. Color palette: 
	tailwind.config.js
	Consistent use of neutral and accent colors across components with Tailwind classes.

###	3. Icons: 
	components/icons/ui/Icon.tsx
	Reusable Icon component integrated throughout the UI.

### 4. Reusable components: 
	components/ 
	tailwind.config.js - colors
	At least 10 components, including Button, Input, LoginForm, ModalContent, LoginModal, 
	HeaderControls, Navigation, Footer, TermsContent, RtlWrapper, Background, LanguageSwitcher, 
	ModalFooter, Heading, etc., all built to be composable and consistent.

	This system ensures maintainable, scalable, and accessible UI design across the project.

--------------------

# Minor: 
## Right-to-left (RTL) language support.

### 1. Support for at least one RTL language (Arabic, Hebrew, etc.).
	Integration of next-intl for seamless management of multiple locales (PL, EN, DE, AR).

### 2. Complete layout mirroring (not just text direction).
	Global layout mirroring and RTL-specific UI adjustments using logical CSS properties.


### 3. RTL-specific UI adjustments where needed.
	Custom styling for iconography and navigational elements, ensuring that UI components flip correctly for Arabic users.
	for example: ms- (not ml-) = margin start (not margin left)

### 4. Seamless switching between LTR and RTL.
	Unified routing system with locale-aware navigation utilities (Link, usePathname, useRouter) that automatically handle direction changes without page reloads or layout shifts.