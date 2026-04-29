import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

interface PreviewFrameProps {
  files: any[];
  webContainer?: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  // In a real implementation, this would compile and render the preview
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!webContainer) return;
    async function main() {
      // Install dependencies
      const installProcess = await webContainer.spawn("npm", ["install"]);

      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        }),
      );

      await installProcess.exit;

      // 🔥 Detect script type
      const packageJsonFile = files.find(
        (file) => file.name === "package.json" || file.path === '/package.json',
      );

      let hasDev = false;

      if (packageJsonFile) {
        const content = packageJsonFile.contents || packageJsonFile.content;
        hasDev = content.includes('"dev"');
      }

      // 🔥 Run correct command
      let startProcess;

      if (hasDev) {
        startProcess = await webContainer.spawn("npm", ["run", "dev"]);
      } else {
        startProcess = await webContainer.spawn("npm", ["start"]);
      }

      startProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        }),
      );

      // Wait for server
      webContainer.on("server-ready", (port, url) => {
        console.log(url, port);
        setUrl(url);
      });
    }

    main();
  }, [webContainer]);
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}
