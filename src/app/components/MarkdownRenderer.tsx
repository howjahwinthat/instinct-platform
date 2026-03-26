interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let currentTable: string[][] = [];
    let inTable = false;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-6 my-4 space-y-2">
            {currentList.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="my-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {currentTable[0].map((cell, i) => (
                    <th key={i} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-left font-semibold text-gray-900 dark:text-white">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTable.slice(2).map((row, i) => (
                  <tr key={i} className="dark:border-gray-600">
                    {row.map((cell, j) => (
                      <td key={j} className="border border-gray-300 dark:border-gray-600 p-3 text-gray-700 dark:text-gray-300">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        currentTable = [];
        inTable = false;
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        flushList();
        flushTable();
        elements.push(<h1 key={index} className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-6">{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        flushList();
        flushTable();
        elements.push(<h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        flushList();
        flushTable();
        elements.push(<h3 key={index} className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">{line.substring(4)}</h3>);
      } else if (line.startsWith('| ') && line.endsWith(' |')) {
        flushList();
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        if (line.includes('---')) return;
        currentTable.push(cells);
        inTable = true;
      } else if (line.startsWith('- ')) {
        flushTable();
        currentList.push(line.substring(2));
      } else if (/^\d+\. /.test(line)) {
        flushTable();
        currentList.push(line.substring(line.indexOf('. ') + 2));
      } else if (line.startsWith('**') && line.endsWith('**')) {
        flushList();
        flushTable();
        elements.push(<p key={index} className="font-bold text-gray-900 dark:text-white my-3">{line.substring(2, line.length - 2)}</p>);
      } else if (line.startsWith('❌ ')) {
        flushList();
        flushTable();
        elements.push(<p key={index} className="text-red-600 dark:text-red-400 my-2">❌ {line.substring(2)}</p>);
      } else if (line.startsWith('✅ ')) {
        flushList();
        flushTable();
        elements.push(<p key={index} className="text-green-600 dark:text-green-400 my-2">✅ {line.substring(2)}</p>);
      } else if (line.trim() === '') {
        flushList();
        if (!inTable) flushTable();
      } else if (line.trim() !== '') {
        if (!inTable) {
          flushList();
          flushTable();
          const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          elements.push(
            <p
              key={index}
              className="text-gray-700 dark:text-gray-300 leading-relaxed my-3"
              dangerouslySetInnerHTML={{ __html: processedLine }}
            />
          );
        }
      }
    });

    flushList();
    flushTable();

    return elements;
  };

  return <div className="markdown-content">{renderMarkdown(content)}</div>;
}