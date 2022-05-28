import React from "react";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "icirclescanvas";

import { Toolbar } from "icirclescanvas/toolbar/toolbar";
import { ZoomButtons } from "icirclescanvas/toolbar/zoom-buttons";
import { SidePanel } from "icirclescanvas/side-panel";
import { Workspace } from "icirclescanvas/canvas/workspace";
import {
  TemplatesSection,
  TextSection,
  PhotosSection,
  ElementsSection,
  UploadSection,
  BackgroundSection,
  PagesSection,
  SizeSection,
} from "icirclescanvas/side-panel";

import { loadFile } from "./file";

// import { VectorSection } from './svg-sidepanel';

import Topbar from "./topbar";

//import { VectorSection } from './svg-sidepanel';

let sections = [
  TemplatesSection,
  TextSection,
  PhotosSection,
  ElementsSection,
  UploadSection,
  BackgroundSection,
  PagesSection,
  SizeSection,
];

const useHeight = () => {
  //console.log(VectorSection);
  const [height, setHeight] = React.useState(window.innerHeight);
  React.useEffect(() => {
    window.addEventListener("resize", () => {
      setHeight(window.innerHeight);
    });
  }, []);
  return height;
};

let url_string = window.location.href;
let url = new URL(url_string);
let username = url.searchParams.get("username");
let designType = url.searchParams.get("design_type");
let designId = url.searchParams.get("design_id");
let newuser = url.searchParams.get("newuser");
let microsite_id = url.searchParams.get("microsite_id");
let user_microsite_id = url.searchParams.get("user_microsite_id");
//let designer = url.searchParams.get("designer");
if (!username) {
  window.location.replace("https://icircles.app/login");
}
if (designType == "bcardh" || designType == "bcardv") {
  sections = sections.splice(0, 6);
}
// if(!designId){

// }

const App = ({ store }) => {
  fetch(
    `https://icircles.app/api/veditor/get_user_json/${username}/${designType}/${designId}/${microsite_id}/${user_microsite_id}`
  )
    .then(async (data) => await data.json())
    .then(async (res) => {
      await store.loadJSON(res);
      //console.log(store.saveAsImage());
      if (newuser) {
        await store.toDataURL().then(async (data) => {
          const formData = new FormData();
          let json = await JSON.stringify(store.toJSON());
          formData.append("image", data);
          formData.append("username", username);
          formData.append("id", designId);
          formData.append("type", designType);
          formData.append("json", json);

          fetch("https://icircles.app/api/veditor/users_design", {
            method: "POST",
            body: formData,
          });
        });
      }
    });

  const handleDrop = (ev) => {
    console.log(ev);
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // skip the case if we dropped DOM element from side panel
    // in that case Safari will have more data in "items"
    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) {
      return;
    }
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  const height = useHeight();

  return (
    <div
      style={{
        width: "100vw",
        height: height + "px",
        display: "flex",
        flexDirection: "column",
      }}
      onDrop={handleDrop}
    >
      <Topbar store={store} />
      <div style={{ height: "calc(100% - 50px)" }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel
              store={store}
              sections={sections}
              defaultSection="templates"
            />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} />
            <Workspace store={store} />
            <ZoomButtons store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
    </div>
  );
};

export default App;
