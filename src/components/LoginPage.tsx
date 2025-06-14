import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

// You can create a separate icons.tsx file for these
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);


export default function LoginPage() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              BoardSuite
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back! Please sign in to your account.
            </p>
        </div>

        <div className="max-w-md w-full mx-auto mt-8 bg-white p-8 border border-gray-200 rounded-lg shadow-lg">
            <form className="space-y-6">
                <div>
                    <Label htmlFor="username">Username</Label>
                    <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 font-bold text-gray-600" />
                        </div>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="your_username"
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockIcon className="h-5 w-5 font-bold text-gray-600" />
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="********"
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <Label htmlFor="remember-me" className="ml-2 font-normal">
                            Remember me
                        </Label>
                    </div>
                    <div className="text-sm">
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Forgot your password?
                        </a>
                    </div>
                </div>

                <div>
                    <Button type="submit" className="w-full">
                        Sign In
                    </Button>
                </div>
            </form>
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} BoardSuite Inc. All rights reserved.
        </p>
    </main>
  );
}