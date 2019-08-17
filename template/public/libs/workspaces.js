const settings = require('electron-settings');
const uuidv1 = require('uuid/v1');

const sendToAllWindows = require('../libs/send-to-all-windows');

const v = '43';

let workspaces;

const countWorkspaces = () => Object.keys(workspaces).length;

const getWorkspaces = () => {
  if (workspaces) return workspaces;

  const defaultWorkspaces = {};
  const initialWorkspaceId = uuidv1();
  defaultWorkspaces[initialWorkspaceId] = {
    id: initialWorkspaceId,
    name: '',
    order: 0,
    active: true,
  };

  workspaces = settings.get(`workspaces.${v}`, defaultWorkspaces);
  return workspaces;
};

const getWorkspacesAsList = () => {
  const workspaceLst = Object.values(getWorkspaces())
    .sort((a, b) => a.order - b.order);

  return workspaceLst;
};

const getWorkspace = (id) => workspaces[id];

const getPreviousWorkspace = (id) => {
  const workspaceLst = getWorkspacesAsList();

  let currentWorkspaceI = 0;
  for (let i = 0; i < workspaceLst.length; i += 1) {
    if (workspaceLst[i].id === id) {
      currentWorkspaceI = i;
      break;
    }
  }

  if (currentWorkspaceI === 0) {
    return workspaceLst[workspaceLst.length - 1];
  }
  return workspaceLst[currentWorkspaceI - 1];
};

const getNextWorkspace = (id) => {
  const workspaceLst = getWorkspacesAsList();

  let currentWorkspaceI = 0;
  for (let i = 0; i < workspaceLst.length; i += 1) {
    if (workspaceLst[i].id === id) {
      currentWorkspaceI = i;
      break;
    }
  }

  if (currentWorkspaceI === workspaceLst.length - 1) {
    return workspaceLst[0];
  }
  return workspaceLst[currentWorkspaceI + 1];
};

const createWorkspace = (active) => {
  const newId = uuidv1();

  // find largest order
  const workspaceLst = getWorkspacesAsList();
  let max = 0;
  for (let i = 0; i < workspaceLst.length; i += 1) {
    if (workspaceLst[i].order > max) {
      max = workspaceLst[i].order;
    }
  }

  const newWorkspace = {
    id: newId,
    name: '',
    order: max + 1,
    active: Boolean(active),
  };

  workspaces[newId] = newWorkspace;
  sendToAllWindows('set-workspace', newId, newWorkspace);
  settings.set(`workspaces.${v}.${newId}`, newWorkspace);

  return newWorkspace;
};

const getActiveWorkspace = () => Object.values(workspaces).find((workspace) => workspace.active);

const setActiveWorkspace = (id) => {
  // deactive the current one
  const currentActiveWorkspace = { ...getActiveWorkspace() };
  currentActiveWorkspace.active = false;
  workspaces[currentActiveWorkspace.id] = currentActiveWorkspace;
  sendToAllWindows('set-workspace', currentActiveWorkspace.id, currentActiveWorkspace);
  settings.set(`workspaces.${v}.${currentActiveWorkspace.id}`, currentActiveWorkspace);

  // active new one
  const newActiveWorkspace = { ...workspaces[id] };
  newActiveWorkspace.active = true;
  workspaces[id] = newActiveWorkspace;
  sendToAllWindows('set-workspace', id, newActiveWorkspace);
  settings.set(`workspaces.${v}.${id}`, newActiveWorkspace);
};

const setWorkspace = (id, opts) => {
  const workspace = { ...workspaces[id], ...opts };
  workspaces[id] = workspace;
  sendToAllWindows('set-workspace', id, workspace);
  settings.set(`workspaces.${v}.${id}`, workspace);
};

const removeWorkspace = (id) => {
  delete workspaces[id];
  sendToAllWindows('set-workspace', id, null);
  settings.delete(`workspaces.${v}.${id}`);
};

module.exports = {
  countWorkspaces,
  createWorkspace,
  getActiveWorkspace,
  getNextWorkspace,
  getPreviousWorkspace,
  getWorkspace,
  getWorkspaces,
  getWorkspacesAsList,
  removeWorkspace,
  setActiveWorkspace,
  setWorkspace,
};
