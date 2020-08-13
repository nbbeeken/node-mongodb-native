import * as gulp from 'gulp';
import { promisify } from 'util';
import { exec, ChildProcess } from 'child_process';
import { writeFileSync, readdirSync, unlinkSync } from 'fs';
import { basename } from 'path';

const run = promisify((commandString: string) => exec(commandString, { encoding: 'utf-8' })) as (
  commandString: string
) => Promise<ChildProcess>;

gulp.task('doc', async () => {
  function generateTypeDocConfig() {
    const tutorials = readdirSync('docs/reference/content/tutorials')
      .filter(filename => filename.endsWith('.md'))
      .map(filename => `docs/reference/content/tutorials/${filename}`);

    const docOptions = {
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

    return docOptions;
  }

  const docOptions = generateTypeDocConfig();

  writeFileSync('./typedoc.json', JSON.stringify(docOptions, undefined, 2), {
    encoding: 'utf8'
  });

  try {
    await run('npx typedoc');
  } catch (err) {
    console.error('typedoc encountered an error:');
    console.error((err.stdout as string).trim());
    console.error((err.stderr as string).trim());
    console.error('typedoc settings:');
    console.error(JSON.stringify(docOptions, undefined, 2));
  } finally {
    unlinkSync('./typedoc.json');
  }
});

gulp.task('definitions', async () => {
  try {
    await run('npm run build:ts');
    const { stdout, stderr } = await run('api-extractor run --local --verbose');
    console.log(stdout);
    console.log(stderr);
    await run('rimraf lib/*.d.ts lib/**/*.d.ts');
    await run('prettier types/mongodb.d.ts --write');
  } catch (err) {
    console.error('encountered an error:');
    console.error((err.stdout as string).trim());
    console.error((err.stderr as string).trim());
  }
});
