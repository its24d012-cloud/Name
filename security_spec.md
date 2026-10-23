# Security Specification for NOVELFLIX Firestore

## 1. Data Invariants
1. **Public Read for Novels**: Published novels can be read by any visitor (unauthenticated or authenticated).
2. **Novel Creation / Modification**: Only authenticated users can publish novels (`request.auth.uid == incoming().authorId`), or updates made to specific fields. Novel document ID must be valid (`isValidId`).
3. **User Profile**: Users can only read and write their own profile document (`request.auth.uid == userId`).
4. **Bookmarks**: A user's bookmarks are stored in `/users/{userId}/bookmarks/{novelId}`. Only the owner (`request.auth.uid == userId`) can read, create, update, or delete their bookmarks.
5. **No Blanket Writes**: Any write must conform to validation helpers (`isValidNovel`, `isValidUserProfile`, `isValidBookmark`).
6. **Default Deny**: All other collections are inaccessible.

## 2. The Dirty Dozen Payloads
1. Unauthorized write to `/novels/{novelId}` without authentication.
2. Spoofed authorId in novel creation (`authorId != request.auth.uid`).
3. Path injection attack with invalid novel ID (containing characters like `/` or `..` or size > 128).
4. Massive synopsis attack (> 3000 chars payload).
5. Unauthenticated read/write to user's private profile `/users/{otherUserId}`.
6. User trying to write someone else's bookmark `/users/{otherUserId}/bookmarks/{novelId}`.
7. Shadow update with illegal keys injected into `novel`.
8. Bookmark creation with spoofed userId.
9. Deleting another author's novel.
10. Unauthenticated deletion of bookmarks.
11. Privilege escalation attempting to write to root collections outside defined paths.
12. Attempt to bypass validation on empty or malformed chapters list.
