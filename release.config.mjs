const parserOpts = {
    headerPattern: /^[^\w\s]+\s*(\w+)(?:\(([^)]+)\))?!?:\s(.*)$/,
    headerCorrespondence: ['type', 'scope', 'subject'],
};

export default {
    branches: ['main'],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'angular',
                parserOpts,
            },
        ],
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'angular',
                parserOpts,
                writerOpts: {
                    transform: (commit) => {
                        if (commit.header) {
                            commit.subject = commit.header;
                        }
                        return commit;
                    },
                },
            },
        ],
        [
            '@semantic-release/npm',
            {
                npmPublish: false,
            },
        ],
        [
            '@semantic-release/changelog',
            {
                changelogFile: 'CHANGELOG.md',
            },
        ],
        [
            '@semantic-release/git',
            {
                assets: ['package.json', 'CHANGELOG.md'],
                // biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release template syntax, not JS
                message: '🔧 chore(release): ${nextRelease.version}',
            },
        ],
        '@semantic-release/github',
    ],
};
