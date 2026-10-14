# Keyword placement

Counted by script against the page as a visitor or crawler sees it: title tag, meta description, visible text (headings, body, FAQ) and image alt text. Phrases are matched exactly, ignoring case, and **overlapping phrases are counted too** (for example "kids eye test near me" also counts toward "eye test near me"). Cap is 2 per phrase; every phrase is at least 1 except the one skipped on purpose.

Two things are listed but **not counted** toward the cap, because they only repeat page copy: the FAQPage/MedicalClinic JSON-LD and the Open Graph tags (columns "Schema" and "OG"). The H1 variants swapped in by `svc` (script.js) contain no listed phrase verbatim, so they do not affect counts.

| Group | Keyword | Count | Where it appears | Schema | OG |
|---|---|---|---|---|---|
| Eye test | eye test near me | 2 | body text in `eye-test`; body text in `myopia` | 0 | 0 |
| Eye test | eye test Koramangala | 2 | meta description in `head`; FAQ answer in `faq` | 1 | 1 |
| Eye test | eye checkup Koramangala | 1 | body text in `eye-test` | 0 | 0 |
| Eye test | comprehensive eye examination Bangalore | 1 | body text in `eye-test` | 0 | 0 |
| Eye test | eye test with doctor | 1 | body text in `eye-test` | 0 | 0 |
| Eye test | eye test HSR Layout | 1 | body text in `location` | 0 | 0 |
| Eye test | eye test BTM Layout | 1 | body text in `location` | 0 | 0 |
| Eye test | eye specialist Koramangala | 2 | body text in `myopia`; body text in `doctor` | 0 | 0 |
| Eye test | eye doctor Koramangala | 1 | body text in `how` | 0 | 0 |
| Eye test | ophthalmologist Koramangala | 1 | body text in `doctor` | 0 | 0 |
| Eye test | ophthalmologist near me | 1 | FAQ answer in `faq` | 1 | 0 |
| Eye test | eye clinic near me | 1 | FAQ answer in `faq` | 1 | 0 |
| Eye test | eye clinic Koramangala | 2 | body text in `doctor` x2 | 1 | 0 |
| Children and myopia | myopia management Bangalore | 1 | heading in `myopia` | 0 | 0 |
| Children and myopia | myopia control children Bangalore | 1 | body text in `myopia` | 0 | 0 |
| Children and myopia | myopia clinic Bangalore | 1 | FAQ answer in `faq` | 1 | 0 |
| Children and myopia | child eyesight power increasing | 1 | body text in `myopia` | 0 | 0 |
| Children and myopia | ortho k lenses Bangalore | 1 | body text in `myopia` | 0 | 0 |
| Children and myopia | orthokeratology Bangalore | 1 | FAQ answer in `faq` | 1 | 0 |
| Children and myopia | child eye specialist Koramangala | 1 | body text in `myopia` | 0 | 0 |
| Children and myopia | pediatric ophthalmologist Bangalore | 0 | **not used** | 0 | 0 |
| Children and myopia | kids eye test near me | 1 | body text in `myopia` | 0 | 0 |
| Children and myopia | children eye doctor near me | 1 | FAQ answer in `faq` | 1 | 0 |
| Children and myopia | eye test for school children | 1 | body text in `myopia` | 0 | 0 |
| Children and myopia | paediatric eye clinic Koramangala | 1 | body text in `doctor` | 0 | 0 |
| Brand | Eye Q Koramangala | 1 | body text in `doctor` | 1 | 0 |
| Brand | Eye Q Opticals | 2 | body text in `top-bar`; body text in `footer` | 2 | 1 |
| Brand | Eye Q eye clinic Koramangala | 1 | body text in `doctor` | 1 | 0 |

## Result

- Every phrase appears 1 or 2 times. None is over the cap.
- **"pediatric ophthalmologist Bangalore" is deliberately unused (0).** It may only be used if Dr. Shetty is confirmed to be described that way. Once confirmed, add it once, for example in the doctor profile.
- Overlaps worth knowing: "eye clinic Koramangala" is used twice only through "paediatric eye clinic Koramangala" and "Eye Q eye clinic Koramangala"; "eye specialist Koramangala" is used once alone and once inside "child eye specialist Koramangala"; "eye test near me" is used once alone and once inside "kids eye test near me". The page title uses "Eye Clinic in Koramangala", which is a different string.
- "Eye Q Opticals" appears twice: the logo ("Eye Q" plus "Opticals & Eye Clinic") and the footer name. Everywhere else the page says "Eye Q".
- Diabetic eye and contact lens sections use plain service language and no target keywords, as requested.
