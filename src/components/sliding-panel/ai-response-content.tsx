import ReactMarkdown from "react-markdown";

interface AIResponseContentProps {
  response: string;
}

export function AIResponseContent({ response }: AIResponseContentProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-white mb-6 mt-8 first:mt-0 border-b border-gray-700 pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-white mb-4 mt-8 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-white mb-3 mt-6 first:mt-0">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-300 mb-4 leading-relaxed text-base">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-outside text-gray-300 mb-6 space-y-2 pl-6">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside text-gray-300 mb-6 space-y-2 pl-6">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-300 leading-relaxed">{children}</li>
            ),
            em: ({ children }) => (
              <em className="text-gray-400 italic">{children}</em>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <div className="mb-6">
                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                    <span className="text-gray-400 text-xs font-medium">
                      CODE
                    </span>
                  </div>
                  <pre className="p-4 overflow-x-auto">{children}</pre>
                </div>
              </div>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-purple-500 pl-4 py-2 mb-4 bg-gray-800/50 italic text-gray-300">
                {children}
              </blockquote>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {children}
              </a>
            ),
          }}
        >
          {response}
        </ReactMarkdown>
      </div>
    </div>
  );
}
