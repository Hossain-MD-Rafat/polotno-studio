import React from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Navbar,
  Alignment,
  // AnchorButton,
  // Divider,
  // Dialog,
  // Classes,
} from "@blueprintjs/core";
// import FaGithub from "@meronex/icons/fa/FaGithub";
// import FaDiscord from "@meronex/icons/fa/FaDiscord";
import DownloadButton from "icirclescanvas/toolbar/download-button";
// import { downloadFile } from "icirclescanvas/utils/download";

import styled from "icirclescanvas/utils/styled";

const NavbarContainer = styled("div")`
  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled("div")`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;
let url_string = window.location.href;
let url = new URL(url_string);
var username = url.searchParams.get("username");
let designType = url.searchParams.get("design_type");
let designId = url.searchParams.get("design_id");
let designer = url.searchParams.get("designer");
let microsite_id = url.searchParams.get("microsite_id");
let product_id = url.searchParams.get("product_id");

export default observer(({ store }) => {
  const inputRef = React.useRef();

  //const [faqOpened, toggleFaq] = React.useState(false);

  return (
    <NavbarContainer className="bp3-navbar">
      <NavInner>
        {microsite_id && !designer ? (
          ""
        ) : (
          <Navbar.Group align={Alignment.LEFT}>
            <Button
              icon="new-object"
              minimal
              onClick={() => {
                const ids = store.pages
                  .map((page) => page.children.map((child) => child.id))
                  .flat();
                const hasObjects = ids?.length;
                if (hasObjects) {
                  if (!window.confirm("Remove all content for a new design?")) {
                    return;
                  }
                }
                const pagesIds = store.pages.map((p) => p.id);
                store.deletePages(pagesIds);
                store.addPage();
              }}
            >
              New
            </Button>
            <label htmlFor="load-project">
              {designer ? (
                <Button
                  icon="folder-open"
                  minimal
                  onClick={() => {
                    document.querySelector("#load-project").click();
                  }}
                >
                  Open
                </Button>
              ) : (
                ""
              )}
              <input
                type="file"
                id="load-project"
                accept=".json,.polotno"
                ref={inputRef}
                style={{ width: "180px", display: "none" }}
                onChange={(e) => {
                  var input = e.target;

                  if (!input.files.length) {
                    return;
                  }

                  var reader = new FileReader();
                  reader.onloadend = function () {
                    var text = reader.result;
                    let json;
                    try {
                      json = JSON.parse(text);
                    } catch (e) {
                      alert("Can not load the project.");
                    }

                    if (json) {
                      store.loadJSON(json);
                      input.value = "";
                    }
                  };
                  reader.onerror = function () {
                    alert("Can not load the project.");
                  };
                  reader.readAsText(input.files[0]);
                }}
              />
            </label>
            <Button
              icon="floppy-disk"
              minimal
              onClick={async () => {
                await store.toDataURL().then(async (data) => {
                  const formData = new FormData();
                  let json = await JSON.stringify(store.toJSON());
                  let url = "";
                  formData.append("image", data);
                  formData.append("username", username);
                  formData.append("id", designId);
                  formData.append("type", designType);
                  formData.append("json", json);
                  formData.append("microsite_id", microsite_id);
                  if (
                    designer === undefined ||
                    designer === null ||
                    designer === false ||
                    designer == 0
                  ) {
                    url = "https://icircles.app/api/veditor/users_design";
                  } else {
                    url = "https://icircles.app/api/veditor/save_design";
                  }
                  const res = await fetch(url, {
                    method: "POST",
                    body: formData,
                  }).then((response) => response.json());

                  //http://localhost/rafat/user/printingpress/rfq/addproduct
                  //https://icircles.app/user/micrositeadmin/printingpress/addProduct/
                  if (res.insert_id && res.path && res.status) {
                    window.location.replace(
                      `https://icircles.app/user/micrositeadmin/printingpress/addProduct/${
                        product_id ? product_id + "/" : ""
                      }?designid=${res.insert_id}&path=${res.path}`
                    );
                  } else {
                    let con = window.confirm(
                      "Your design has been saved. Do you want to exit now!"
                    );
                    if (con) {
                      window.location.replace("https://icircles.app");
                    }
                  }
                });
              }}
            >
              Save
            </Button>
            {designType == "bcardh" || designType == "bcardv" ? (
              <Button
                minimal
                style={{ color: "#ffc107" }}
                onClick={() => {
                  window.location.replace(
                    "https://icircles.app/user/wcdashboard/your"
                  );
                }}
              >
                Cancel
              </Button>
            ) : (
              ""
            )}
          </Navbar.Group>
        )}

        <Navbar.Group align={Alignment.RIGHT}>
          <DownloadButton store={store} />
          {microsite_id && designId ? (
            <div>
              <Button
                minimal
                style={{ color: "#5ce2fd" }}
                onClick={async () => {
                  await store.toDataURL().then(async (data) => {
                    const formData = new FormData();
                    //let json = await JSON.stringify(store.toJSON());
                    formData.append("image", data);
                    formData.append("username", username);
                    formData.append("id", designId);
                    formData.append("type", designType);
                    formData.append("microsite_id", microsite_id);
                    formData.append("submit", true);
                    fetch(
                      " https://icircles.app/api/veditor/addtemplatetocart",
                      {
                        method: "POST",
                        body: formData,
                      }
                    )
                      .then((response) => response.json())
                      .then((data) => {
                        if (data.status == 200) {
                          window.location.replace(
                            `https://icircles.app/printingpress/designpreview/${microsite_id}/${data.id}`
                          );
                        }
                      });
                  });
                }}
              >
                Continue
              </Button>
              <Button
                minimal
                style={{ color: "#ffc107" }}
                onClick={() => {
                  window.location.replace(
                    `https://icircles.app/printingpress/home/${microsite_id}`
                  );
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              minimal
              style={{ color: "#5ce2fd" }}
              onClick={async () => {
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
                window.location.replace(
                  `https://icircles.app/orderprint/editor/${username}/${designType}/${designId}`
                );
              }}
            >
              Order Print
            </Button>
          )}
          {/* <a
          href="https://www.producthunt.com/posts/polotno-studio?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-polotno-studio"
          target="_blank"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=281373&theme=dark"
            alt="Polotno Studio - Canva-like design editor, without signups or ads. | Product Hunt"
            style={{ height: '30px', marginBottom: '-4px' }}
          />
        </a> */}
          <a href="https://icircles.app/">
            <img
              style={{ margin: "0px 24px", height: "32px" }}
              src="https://icircles.app/uploads/images/medium/logo.png"
            />
          </a>

          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
