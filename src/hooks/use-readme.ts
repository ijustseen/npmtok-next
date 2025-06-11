import { useAIPanel } from "@/contexts/ai-panel-context";

export function useReadme() {
  const { setResponse, setLoading } = useAIPanel();

  const loadReadme = async (repository: { owner: string; name: string }) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repository.owner}/${repository.name}/readme`,
        {
          headers: {
            Accept: "application/vnd.github.v3.raw",
          },
        }
      );

      if (!response.ok) {
        throw new Error("README not found");
      }

      const content = await response.text();
      setResponse(content, false);
    } catch (error) {
      console.error("Error loading README:", error);
      setResponse(
        `# README не найден\n\nНе удалось загрузить README для этого репозитория.\n\nПричины могут быть:\n- README файл отсутствует\n- Репозиторий приватный\n- Проблемы с GitHub API\n\nПопробуйте посетить репозиторий напрямую: [${repository.owner}/${repository.name}](https://github.com/${repository.owner}/${repository.name})`,
        true
      );
    } finally {
      setLoading(false);
    }
  };

  return { loadReadme };
}
