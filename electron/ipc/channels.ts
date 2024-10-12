export enum RendererToMainChannels {
	OPEN_DIRECTORY = "dialog:openDirectory",
	OPEN_FILE = "dialog:openFile",
	JOIN_PATHS = "joinPaths",
	FILE_OPERATION = "fileOperation",
	SELECT_FOLDER = "selectFolder",
	CLOSE_APP = "closeApp",
	CLOSE_WINDOW = "closeWindow",
	GET_APP_VERSION = "getAppVersion",
	MATCHING_FILE = "matchingFile",
	LOAD_SETTINGS = "loadSettings",
	UPDATE_SETTINGS = "updateSettings",
	LOG_UPDATE = "log-update",

	CONTEXT_MENU = "context-menu",
	MINIMIZE_WINDOW = "minimizeWindow",

	CHECK_FOR_UPDATES = "checkForUpdates",
	START_UPDATE_DOWNLOAD = "startUpdateDownload",
	INSTALL_UPDATE = "installUpdate",

	OPEN_EXTERNAL_LINK = "openExternalLink",
	PLAY_MOVIE = "playMovie",
}

export type IpcChannel = RendererToMainChannels | MainToRendererChannels;

export enum MainToRendererChannels {
	TIP_MESSAGE = "tipMessage",
	PERFORMANCE_DATA = 'performance-data',
	FILE_DELETED = 'file-deleted',
	UPDATE_FAVORITE = 'update-favorite',
	UPDATE_DOWNLOAD_PROGRESS = 'update-download-progress',
	LOG_UPDATE = "log-update",
}