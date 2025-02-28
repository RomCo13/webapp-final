import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { googleSignin, loginUser, IUser } from '../services/user-service'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

function Login({ onLoginSuccess }: LoginProps) {
    const emailInputRef = useRef<HTMLInputElement>(null)
    const passwordInputRef = useRef<HTMLInputElement>(null)

    const login = async () => {
        if (emailInputRef.current?.value && passwordInputRef.current?.value) {
            const user: Partial<IUser> = {
                email: emailInputRef.current?.value,
                password: passwordInputRef.current?.value,
            }
            try {
                const res = await loginUser(user)
                console.log("Login successful:", res)
                onLoginSuccess(user.email!)
            } catch (e) {
                console.log("Login failed:", e)
            }
        }
    }

    const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const res = await googleSignin(credentialResponse)
            console.log("Google login successful:", res)
            onLoginSuccess(res.email)
        } catch (e) {
            console.log("Google login failed:", e)
        }
    }

    const onGoogleLoginFailure = () => {
        console.log("Google login failed")
    }

    return (
        <div className="vstack gap-3 col-md-7 mx-auto">
            <h1 className="mb-4">Login</h1>
            
            <div className="form-group mb-3">
                <label htmlFor="emailInput" className="form-label">Email</label>
                <input 
                    ref={emailInputRef} 
                    type="email" 
                    className="form-control" 
                    id="emailInput"
                    placeholder="Enter your email"
                />
            </div>
            
            <div className="form-group mb-3">
                <label htmlFor="passwordInput" className="form-label">Password</label>
                <input 
                    ref={passwordInputRef} 
                    type="password" 
                    className="form-control" 
                    id="passwordInput"
                    placeholder="Enter your password"
                />
            </div>
            
            <button 
                type="button" 
                className="btn btn-primary mb-3" 
                onClick={login}
            >
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                Login
            </button>

            <div className="text-center mb-3">OR</div>
            
            <div className="d-flex justify-content-center">
                <GoogleLogin 
                    onSuccess={onGoogleLoginSuccess} 
                    onError={onGoogleLoginFailure} 
                />
            </div>
        </div>
    )
}

export default Login