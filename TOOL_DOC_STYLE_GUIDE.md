## 2  TOOL‑DOC STYLE GUIDE — Version 1.0 (frozen at Step B)

> **Purpose** – Guarantee that every `server.tool()` description is crystal‑clear, machine‑parsable, and uniform, so downstream AI agents and humans can rely on predictable structure.

### 2.1 Section Order

**Complex tools** (with parameters or rich responses) MUST use the following top‑level sections **in this exact order**. Each heading is a bolded label ending with a colon:

1. **Overview:** – 1–3 sentences summarising purpose.  
2. **Request Parameters:** – purpose & bullet list of parameters.  
3. **Available Response Fields:** – broken down as needed.  
4. **Examples:** – fenced‑code request / response snippets.  
5. **Default Fields:** or **Fixed Fields:** – whichever applies.  
6. **Notes:** and/or **Warnings:** – optional, as needed.

**Simple tools** (no body, trivial query) may omit sections 3‑6 and instead provide a single short paragraph.

### 2.2 Heading Syntax

* Use `**Heading Name:**` (bold, colon) – **never** Markdown `#`/`##` for tool sections.  
* Only exception: in rare tutorials inside Examples you may use `###` inside fenced code comments.

### 2.3 Bullet & Number Lists

* Top level bullets: `*` plus one space.  
* Second level bullets: `-` plus one space, indented 2 spaces from parent bullet’s text.  
* Numbered lists: `1.` `2.` etc. followed by one space.

### 2.4 Inline Code & Emphasis

* Wrap **all** parameter names, field names, literals, and code tokens in back‑ticks.  
* Avoid italics; reserve bold for section headings only.

### 2.5 Parameter Lists

Inside **Request Parameters:** create two explicit sub‑headings (bold‑colon style):

* **Required Parameters:**  
* **Optional Parameters:**  

Each parameter line format:

```
`parameterName` (type, required|optional): concise description. (Valid values: …)
```

### 2.6 Examples

* Always a dedicated **Examples:** section.  
* Provide at least:  
  * One minimal example (smallest valid call).  
  * One advanced example (multiple parameters or body).  
* Use fenced code blocks with language hint (`json`, `bash`, etc.).

### 2.7 Default vs Fixed Fields Wording

* Default‑field paragraph:  
  *“**Default Fields** (when \`fields\` is omitted): id, name, …”*  
* Fixed‑field paragraph:  
  *“This tool always returns the following **Fixed Fields**: id, …”*

### 2.8 Notes & Warnings

* Use `**Note:**` or `**Warning:**` followed by one space and the message.  
* Place immediately after the section to which it applies.

### 2.9 Cross‑references

* Reference other tools by wrapping the tool name in back‑ticks (`get_tasks_by_taskId`).  
* Only add Markdown links for external URLs.

### 2.10 String Interpolation for Default Fields

When a TypeScript constant array exists (e.g., `GET_TASKS_DEFAULT_FIELDS`), embed it:

```
${GET_TASKS_DEFAULT_FIELDS.join(', ')}
```

Never hard‑code the list in the description string.