"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Globe } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login:", email, password)
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0d0d0d] font-sans text-white overflow-hidden">
      {/* Fondo de circuitos con candado */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/dark-circuit-board-pattern-with-golden-padlock-sec.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Overlay oscuro */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Selector de idioma */}
      <div className="absolute top-4 right-6 z-30 flex items-center gap-2 text-sm text-white cursor-pointer hover:text-gray-300">
        <Globe size={16} />
        <span>Español</span>
      </div>

      {/* Contenedor principal */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Logo Credentials */}
        <div className="mb-6 flex flex-col items-center">
          <div className="text-4xl font-bold tracking-tight text-white flex items-baseline">
            <span>Creden</span>
            <span className="text-[#E6C200] relative">
              t<span className="absolute -top-1 left-0 w-full h-0.5 bg-[#E6C200]"></span>
            </span>
            <span>ials</span>
          </div>
          <div className="text-[9px] tracking-[0.2em] text-white/80 mt-0.5">by Nicklcs</div>
        </div>

        {/* Caja del login */}
        <div className="w-full max-w-[380px]">
          <h2 className="mb-6 text-center text-xl font-bold text-white">Bienvenido de nuevo</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Input Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded h-[46px] px-4 text-gray-700 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E6C200] text-sm"
              placeholder="Correo electrónico"
            />

            {/* Input Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded h-[46px] px-4 pr-12 text-gray-700 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E6C200] text-sm"
                placeholder="Contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Botón Inicia sesión */}
            <button
              type="submit"
              className="mt-1 w-full rounded h-[46px] bg-[#E6C200] text-black font-bold text-sm tracking-wide transition-all hover:bg-[#d4b000] active:scale-[0.98]"
            >
              Inicia sesión
            </button>
          </form>

          {/* Enlace Recuperar Contraseña */}
          <div className="mt-4 text-center">
            <a href="#" className="text-sm font-semibold text-white hover:underline hover:text-[#E6C200]">
              Crea tu nueva contraseña ahora
            </a>
          </div>

          {/* Crear cuenta */}
          <div className="mt-4 text-center text-sm text-white">
            ¿Aún no tienes tu cuenta Lite Thinking?
            <br />
            <a href="#" className="font-bold hover:text-[#E6C200] underline">
              Crea tu cuenta
            </a>
          </div>

          {/* Separador */}
          <div className="mt-6 mb-4 text-center text-sm text-gray-300">O inicia sesión usando:</div>

          {/* Botones Sociales */}
          <div className="flex flex-col gap-3">
            <button className="flex w-full items-center justify-center gap-3 rounded h-[46px] bg-white text-sm font-bold text-gray-800 transition hover:bg-gray-100">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button className="flex w-full items-center justify-center gap-3 rounded h-[46px] bg-white text-sm font-bold text-gray-800 transition hover:bg-gray-100">
              <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
