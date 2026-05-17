import type { UserConfig } from '@commitlint/types';

const emojiMap: Record<string, string> = {
    feat: '✨',
    fix: '🐛',
    ci: '👷',
    docs: '📝',
    style: '🎨',
    refactor: '♻️',
    perf: '⚡',
    test: '✅',
    chore: '🔧',
    build: '📦',
    revert: '⏪',
};

const config: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    parserPreset: {
        parserOpts: {
            headerPattern: /^[\p{Emoji_Presentation}\p{Emoji}]\p{Emoji_Modifier}?\s*(\w+)(?:\(([^)]+)\))?!?:\s(.*)$/u,
            headerCorrespondence: ['type', 'scope', 'subject'],
        },
    },
    plugins: [
        {
            rules: {
                'emoji-prefix': (parsed: { header: string }) => {
                    const { header } = parsed;
                    const match = header.match(
                        /^(\p{Emoji_Presentation}|\p{Emoji})\p{Emoji_Modifier}?\s*(\w+)(?:\(.*\))?!?:\s/u,
                    );

                    if (!match) {
                        return [
                            false,
                            'Commit message must start with an emoji followed by type. Format: <emoji> <type>(<scope>): <description>\n' +
                                'Available types:\n' +
                                Object.entries(emojiMap)
                                    .map(([type, emoji]) => `  ${emoji} ${type}`)
                                    .join('\n'),
                        ];
                    }

                    const [, , type] = match;
                    const actualEmoji = header.trimStart().split(/\s+/u)[0];
                    const expectedEmoji = emojiMap[type];

                    if (!expectedEmoji) {
                        const validTypes = Object.keys(emojiMap).join(', ');
                        return [false, `Unknown type "${type}". Valid types: ${validTypes}`];
                    }

                    if (actualEmoji !== expectedEmoji) {
                        return [
                            false,
                            `Wrong emoji for type "${type}". Expected "${expectedEmoji}", got "${actualEmoji}".`,
                        ];
                    }

                    return [true];
                },
            },
        },
    ],
    rules: {
        'type-enum': [2, 'always', Object.keys(emojiMap)],
        'emoji-prefix': [2, 'always'],
    },
};

export default config;
