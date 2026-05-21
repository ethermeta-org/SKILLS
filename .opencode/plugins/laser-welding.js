/**
 * Laser Welding Skills plugin for OpenCode.ai.
 *
 * Registers this repository's skills directory and injects a concise bootstrap
 * prompt so OpenCode knows to use the laser-welding skill and Lasernexus MCP
 * server for process parameters instead of inventing them.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../../skills');
const primarySkillPath = path.join(skillsDir, 'laser-welding', 'SKILL.md');

let bootstrapCache = undefined;

const readPrimarySkillSummary = () => {
  if (bootstrapCache !== undefined) return bootstrapCache;

  let fullContent;

  try {
    if (!fs.existsSync(primarySkillPath)) {
      bootstrapCache = null;
      return bootstrapCache;
    }

    fullContent = fs.readFileSync(primarySkillPath, 'utf8');
  } catch {
    bootstrapCache = null;
    return bootstrapCache;
  }

  const body = fullContent.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  const firstSections = body.split('\n## ').slice(0, 3).join('\n## ');

  bootstrapCache = `
Laser Welding Skills are available in this OpenCode session.

Use the laser-welding skill for laser welding process engineering. If the
Lasernexus MCP server is connected, call its tools for material assessment,
hardware selection, DOE, defect diagnosis, trajectory generation, fieldbus
mapping, and code generation.

Primary skill excerpt:
${firstSections}
`;

  return bootstrapCache;
};

export const LaserWeldingPlugin = async () => {
  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];

      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = readPrimarySkillSummary();
      const messages = output?.messages;
      if (!bootstrap || !Array.isArray(messages) || !messages.length) return;

      const firstUser = messages.find((message) => message?.info?.role === 'user');
      if (!firstUser) return;

      const alreadyInjected = messages.some((message) =>
        Array.isArray(message?.parts)
          ? message.parts.some(
              (part) =>
                part?.type === 'text' &&
                typeof part.text === 'string' &&
                part.text.includes('Laser Welding Skills are available in this OpenCode session.')
            )
          : false
      );

      if (alreadyInjected) return;

      const parts = Array.isArray(firstUser.parts) ? firstUser.parts : [];
      const ref = parts[0] || {};
      firstUser.parts = parts;
      firstUser.parts.unshift({
        ...ref,
        type: 'text',
        text: bootstrap
      });
    }
  };
};
