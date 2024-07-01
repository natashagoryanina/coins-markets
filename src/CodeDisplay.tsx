import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { appSourceCode } from "./SourceCode";
import { Typography } from "antd";

const { Title } = Typography;

const CodeDisplay = () => {
  return (
    <div style={{marginTop: 20}}>
      <Title level={2}>App source code</Title>
      <CodeMirror
        value={appSourceCode}
        height="100%"
        extensions={[javascript({ jsx: true })]}
        onChange={() => {}}
        readOnly={true}
        theme="dark"
      />
    </div>
  );
};

export default CodeDisplay;
