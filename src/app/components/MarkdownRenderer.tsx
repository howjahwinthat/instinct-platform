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
              <li key={i} className="text-gray-700">{item}</li>
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
                    <th key={i} className="border border-gray-300 bg-gray-50 p-3 text-left font-semibold">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTable.slice(2).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="border border-gray-300 p-3">{cell}</td>
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
      // Handle headers
      if (line.startsWith('# ')) {
        flushList();
        flushTable();
        elements.push(<h1 key={index} className="text-3xl font-bold text-gray-900 mb-4 mt-6">{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        flushList();
        flushTable();
        elements.push(<h2 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-8">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        flushList();
        flushTable();
        elements.push(<h3 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-6">{line.substring(4)}</h3>);
      }
      // Handle tables
      else if (line.startsWith('| ') && line.endsWith(' |')) {
        flushList();
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        if (line.includes('---')) {
          // Skip separator row
          return;
        }
        currentTable.push(cells);
        inTable = true;
      }
      // Handle lists
      else if (line.startsWith('- ')) {
        flushTable();
        currentList.push(line.substring(2));
      } else if (/^\d+\. /.test(line)) {
        flushTable();
        currentList.push(line.substring(line.indexOf('. ') + 2));
      }
      // Handle special markers
      else if (line.startsWith('**') && line.endsWith('**')) {
        flushList();
        flushTable();
        elements.push(<p key={index} className="font-bold text-gray-900 my-3">{line.substring(2, line.length - 2)}</p>);
      } else if (line.startsWith('❌ ')) {
        flushList();
        flushTable();
        elements.push(<p key={index} className="text-red-600 my-2">❌ {line.substring(2)}</p>);
      } else if (line.startsWith('✅ ')) {
        flushList();
        flushTable();
        elements.push(<p key={index} className="text-green-600 my-2">✅ {line.substring(2)}</p>);
      }
      // Empty lines
      else if (line.trim() === '') {
        flushList();
        if (!inTable) {
          flushTable();
        }
      }
      // Regular paragraphs
      else if (line.trim() !== '') {
        if (!inTable) {
          flushList();
          flushTable();
          // Handle inline bold
          const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          elements.push(
            <p 
              key={index} 
              className="text-gray-700 leading-relaxed my-3"
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
