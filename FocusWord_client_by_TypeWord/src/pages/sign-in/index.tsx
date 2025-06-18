/**
 * @page SignIn/Registration
 */
import styles from "./index.module.css"
import Input from "@/src/shared/ui/Input/ui-input";
import { Checkbox } from "@/src/shared/ui";
// @ts-ignore
import Button from '@/src/shared/ui/button/ui-button';
import logo from '@/src/public/logo.svg'
import Image from "next/image";
import autoMockOn = jest.autoMockOn;
const SignIn = () => {
  return <div className="app light">
    <div className={styles.containerSignin}>
      <div className={styles.contentSignIn}>
       <div className={styles.logo}><Image src={logo} alt={'logo'} height={40}/></div>
        <div>Login</div>
        <Input placeholder={'Email or phone number'}/>
       <div>Password</div>
        <Input placeholder={'Enter password'}/>
        <Checkbox/> <div>Remember me</div>
        <Button style={{width:'360px',height:'40px'}} theme={'secondary'}>Login</Button>
        <hr/><br/>
        <div>Dont have an account?</div>
        <div>Sign up now</div>

      </div>
    </div>

  </div>;
};

export default SignIn;
