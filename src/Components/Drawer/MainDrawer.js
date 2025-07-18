// MainDrawer.js
import React from "react";
import Drawer from "rc-drawer";
import "rc-drawer/assets/index.css"; // IMPORTANT: Import rc-drawer CSS

function MainDrawer({ children, drawerOpen, closeDrawer }) {
  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      level={null}
      handler={false}
      placement="right"
      width={300}
    >
      {children}
    </Drawer>
  );
}

export default MainDrawer;
