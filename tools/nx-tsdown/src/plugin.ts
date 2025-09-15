import { type CreateNodesV2, logger } from '@nx/devkit';
import { dirname } from 'path';

export const createNodesV2: CreateNodesV2 = [
  '**/tsdown.config.ts',
  (configFiles, options, context) => {
    logger.info(
      `[nx-tsdown] Processing ${configFiles.length} tsdown config files`
    );

    return configFiles.map((configFile) => {
      const projectRoot = dirname(configFile);
      logger.info(`[nx-tsdown] Found tsdown.config.ts in ${projectRoot}`);

      const buildTarget = {
        executor: 'nx:run-commands',
        options: {
          command: 'npx tsdown',
          cwd: projectRoot,
        },
        outputs: [`{projectRoot}/dist`],
        cache: true,
        inputs: [
          `{projectRoot}/src/**/*.ts`,
          `{projectRoot}/tsconfig.lib.json`,
          `{projectRoot}/tsdown.config.ts`,
          `{projectRoot}/package.json`,
          { externalDependencies: ['tsdown'] },
        ],
        dependsOn: ['^build'],
      };

      return [
        configFile,
        {
          projects: {
            [projectRoot]: {
              targets: {
                build: buildTarget,
              },
            },
          },
        },
      ];
    });
  },
];
