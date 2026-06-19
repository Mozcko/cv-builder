import { parseMarkdownToCV } from './src/utils/markdownParser';
const md = `
# John Doe

**New York** | **john@example.com** | **123456**
<br>

A summary here

## Professional Experience

<table>
  <tr><td><strong>ACME</strong></td><td><em>Developer</em></td></tr>
  <tr><td><em>NY</em></td><td><em>2021-01 - Present</em></td></tr>
</table>

- Did stuff
`;
const res = parseMarkdownToCV(md, 'en');
console.log(JSON.stringify(res, null, 2));
