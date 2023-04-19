
import { customAlphabet } from "nanoid";
import lowercase from "nanoid-dictionary/lowercase";

const nanoid = customAlphabet(lowercase);

export default nanoid;
