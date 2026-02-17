# User Stories for End-to-End Tests

## 1. Sign Up (Registration)

| # | User Story | Test Scenario |
|---|------------|---------------|
| 1.1 | As a new user, I can register with all required fields | Fill first_name, last_name, username, email, password, password_confirm, accept terms → submit → success |
| 1.2 | As a new user, I see an error for empty required fields | Leave fields empty → submit → validation errors shown |
| 1.3 | As a new user, I see an error for invalid email format | Enter invalid email → submit → "invalid email" error shown |
| 1.4 | As a new user, I see an error for weak password | Enter password without uppercase → submit → password requirements error |
| 1.5 | As a new user, I see an error when passwords don't match | Enter different password_confirm → submit → password match error |
| 1.6 | As a new user, I cannot register without accepting terms | Leave terms checkbox unchecked → submit → error shown |
| 1.7 | As a new user, I see an error when username already exists | Use existing username → submit → "username exists" error |
| 1.8 | As a new user, I see an error when email already exists | Use existing email → submit → "email exists" error |
| 1.9 | As a new user, I can upload a valid avatar image | Select jpg/png/webp file → submit → no error |
| 1.10 | As a new user, I see an error for invalid avatar format | Select non-image file → submit → "invalid image" error |
| 1.11 | As a new user, I can toggle password visibility | Click eye icon → password text revealed |
| 1.12 | As a registered user, I can log in after registration | Register → login with same credentials → success |

---

## 2. Sign In (Login)

| # | User Story | Test Scenario |
|---|------------|---------------|
| 2.1 | As a user, I can log in with valid email and password | Enter valid credentials → submit → redirect with `auth=login_success` |
| 2.2 | As a user, I see an error for invalid email | Enter non-existent email → submit → "invalid credentials" error |
| 2.3 | As a user, I see an error for wrong password | Enter correct email, wrong password → submit → "invalid credentials" error |
| 2.4 | As a user, I see an error for empty fields | Leave email/password empty → submit → validation errors |
| 2.5 | As a user, I can toggle password visibility | Click eye icon → password text revealed |
| 2.6 | As a user, I can log in via GitHub OAuth | Click GitHub button → redirect to GitHub OAuth |
| 2.7 | As a user, I see success message after login | Login successfully → see "login_success" in URL |
| 2.8 | As a logged-in user, I cannot access login page | Already logged in → navigate to login → redirect or show logged-in state |

---

## 3. Combined Authentication Flows

| # | User Story |
|---|------------|
| 3.1 | As a user, I can switch from login to registration modal |
| 3.2 | As a user, I can switch from registration to login modal |
| 3.3 | As a logged-in user, I see my username in the header |
| 3.4 | As a logged-in user, I can log out |

---

## 4. Navigation & Accessibility

| # | User Story |
|---|------------|
| 4.1 | As a keyboard user, I can bypass navigation using skip link |
| 4.2 | As a user, I can navigate to all main pages via header links |
| 4.3 | As a user, I can use the search functionality to find content |

---

## 5. Language & Localization

| # | User Story |
|---|------------|
| 5.1 | As a user, I can switch between EN, PL, DE, AR languages |
| 5.2 | As an Arabic user, I see the interface mirrored (RTL) |
| 5.3 | As a user, language preference persists across page navigation |

---

## 6. Home Page

| # | User Story |
|---|------------|
| 6.1 | As a visitor, I can view recommended plants on the home page |
| 6.2 | As a user, I see a success message after logging in |

---

## 7. Gardens

| # | User Story |
|---|------------|
| 7.1 | As a user, I can view a list of all gardens |
| 7.2 | As a user, I can create a new garden |
| 7.3 | As a garden owner, I can add users to my garden |
| 7.4 | As a garden owner, I can remove users from my garden |
| 7.5 | As a user, I can view garden details with plants |

---

## 8. Plants

| # | User Story |
|---|------------|
| 8.1 | As a user, I can view my plants in my profile |
| 8.2 | As a user, I can add a new plant |
| 8.3 | As a user, I can view plant details |
| 8.4 | As a user, I can assign a plant to a garden |

---

## 9. User Profiles

| # | User Story |
|---|------------|
| 9.1 | As a user, I can view my own profile |
| 9.2 | As a user, I can view other users' profiles |
| 9.3 | As a user, I can see follower/following counts |
| 9.4 | As a user, I can follow another user |
| 9.5 | As a user, I can unfollow another user |
| 9.6 | As a user, I can update my profile information |

---

## 10. Social Feed

| # | User Story |
|---|------------|
| 10.1 | As a user, I can view a personalized feed |
| 10.2 | As a user, I can create a new pin/post |
| 10.3 | As a user, I can view pins from followed users |
| 10.4 | As a user, I can delete my own pins |

---

## 11. Chat/Messaging

| # | User Story |
|---|------------|
| 11.1 | As a user, I can view my inbox with conversations |
| 11.2 | As a user, I can send a message to another user |
| 11.3 | As a user, I can view message history with a user |
| 11.4 | As a user, I can see unread message counts |

---

## 12. Static Pages

| # | User Story |
|---|------------|
| 12.1 | As a user, I can view the About Us page |
| 12.2 | As a user, I can view the Contact page |
| 12.3 | As a user, I can view the Privacy Policy |
| 12.4 | As a user, I can view the Terms of Service |

---

## 13. Search

| # | User Story |
|---|------------|
| 13.1 | As a user, I can search for users |
| 13.2 | As a user, I can search for plants |
