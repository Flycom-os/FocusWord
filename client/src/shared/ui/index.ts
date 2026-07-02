import UiButton from "@/src/shared/ui/Button/ui-button";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/src/shared/ui/Table/ui-table";
import { SelectableTableRow } from "@/src/shared/ui/Table/ui-table-row-selectable";
import { SelectableTableHead } from "@/src/shared/ui/Table/ui-table-head-selectable";
import Checkbox from "@/src/shared/ui/Checkbox/ui-checkbox";
import Radio from "@/src/shared/ui/Radio/ui-radio";
import Select from "@/src/shared/ui/Select/ui-select";
import Modal from "@/src/shared/ui/Modal/ui-modal";
import Pagination from "./Pagination/ui-pagination";
import Notifications, { showToast } from "./Notifications/ui-notifications";

import PopUp from "./PopUp/ui-popup";
import AudioPlayer from "./AudioPlayer/ui-audio";
import VideoPlayer from "./VideoPlayer/ui-video";
import Body from "./Body/ui-body";
import Grid from "./Grid/ui-grid";
import Header from "./Header/ui-site-header";
import Footer from "./Footer/ui-site-footer";
import PageSlider from "./PageSlider/PageSlider";

export { UiButton };
export { Checkbox };
export { Radio };
export { Select };
export { Modal };
export { Pagination };
export { Notifications, showToast };
export { PopUp };
export { AudioPlayer };
export { VideoPlayer };
export { Body, Grid };
export { Header, Footer };
// export type { Button };
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
export { SelectableTableRow, SelectableTableHead };
export { default as PermissionGate } from "./PermissionGate";
export { PageSlider };
