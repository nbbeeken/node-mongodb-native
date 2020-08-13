import * as gulp from 'gulp';
import { promisify } from 'util';
import { exec } from 'child_process';
import { writeFileSync, readdirSync, unlinkSync } from 'fs';
import { basename } from 'path';

gulp.task('typedoc', async () => {
  function generateTypeDocConfig() {
    const tutorials = readdirSync('docs/reference/content/tutorials')
      .filter(filename => filename.endsWith('.md'))
      .map(filename => `docs/reference/content/tutorials/${filename}`);

    const typedocOptions = {
      entryPoint: 'types/mongodb.d.ts',
      mode: 'file',
      out: 'docs/gen',
      theme: 'pages-plugin',
      excludeNotExported: true,
      stripInternal: true,
      pages: {
        enableSearch: true,
        listInvalidSymbolLinks: true,
        output: 'pages',
        groups: [
          {
            title: 'Documentation',
            pages: [
              {
                title: 'FAQ',
                source: 'docs/reference/content/reference/faq/index.md'
              }
            ]
          },
          {
            title: 'Tutorials',
            pages: [
              {
                title: 'Quick Start',
                source: 'docs/reference/content/quick-start/quick-start.md',
                children: tutorials.map(filepath => ({
                  title: basename(filepath).replace('.md', ''),
                  source: filepath
                }))
              }
            ]
          }
        ]
      }
    };

    return typedocOptions;
  }

  const typedocOptions = generateTypeDocConfig();

  writeFileSync('./typedoc.json', JSON.stringify(typedocOptions, undefined, 2), {
    encoding: 'utf8'
  });

  try {
    await promisify(exec)('npx typedoc');
  } catch (err) {
    console.error('typedoc encountered an error:');
    console.error((err.stdout as string).trim());
    console.error((err.stderr as string).trim());
    console.error('typedoc settings:');
    console.error(JSON.stringify(typedocOptions, undefined, 2));
  } finally {
    unlinkSync('./typedoc.json');
  }
});
