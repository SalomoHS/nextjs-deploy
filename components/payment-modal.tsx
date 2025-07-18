"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Building2, CheckCircle, Copy, Clock, CircleX  } from "lucide-react"
import { cn } from "@/lib/utils"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronUp, ChevronDown } from "lucide-react";
import Image from 'next/image';
import { ConfirmModal } from "@/components/confirmation-modal";

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  amount: number
  processingType: "generate_shorts" | "edit_short"
}

interface VANumber {
  bank: string;
  va_number: string;
}

interface Actions {
  name:string,
  method:string,
  url:string,
}

interface ChargeResponse {
  status_code: string,
    status_message: string,
    transaction_id: string,
    order_id: string,
    merchant_id: string,
    gross_amount: string,
    currency: string,
    payment_type: string,
    transaction_time: string,
    transaction_status: string,
    va_numbers?: VANumber[],
    fraud_status: string,
    actions?: Actions[]
}

interface ChargeData {
  chargeResponse: ChargeResponse;
}


type PaymentMethod = "gopay" | "qris" | "virtual_account"
type BankMethod = "bri" | "mandiri" | "bca" | "bni" | "permata"
type PaymentStep = "select" | "processing" | "success" | "failed"

export function PaymentModal({ isOpen, onClose, onPaymentSuccess, amount, processingType }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [selectedBank, setSelectedBank] = useState<BankMethod | null>(null)
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("select")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPayment, setIsLoadingPayment] = useState(true)
  const [virtualAccountNumber, setVirtualAccountNumber] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [isVAOpen, setIsVAOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chargeData, setChargeData] = useState<ChargeData | null>(null);


  // let chargeData: ChargeData
  

  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /android|iphone|ipad|ipod/i.test(userAgent);
    setIsMobile(mobile);
    
  }, [isMobile]);

  console.log(isMobile)
  const paymentMethods = [
    {
      id: "qris" as PaymentMethod,
      name: "QRIS",
      icon: "/images/qris.svg",
      color: "bg-blue-500",
    },
    {
      id: "gopay" as PaymentMethod,
      name: "GoPay",
      icon: "/images/gopay.svg",
      color: "bg-white-500",
    }
  ]

  const banks = [
    {
      id: "bri" as BankMethod,
      name: "BRI",
      logo: "🏦", // In real app, use actual bank logos
    },
    {
      id: "mandiri" as BankMethod,
      name: "Mandiri",
      logo: "🏦",
    },
    {
      id: "bca" as BankMethod,
      name: "BCA",
      logo: "🏦",
    },
    {
      id: "bni" as BankMethod,
      name: "BNI",
      logo: "🏦",
    },
    {
      id: "permata" as BankMethod,
      name: "Permata",
      logo: "🏦",
    },
  ]

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    
    if (method !== "virtual_account") {
      setSelectedBank(null)
      setIsVAOpen(false)
    } else{
      setIsVAOpen(!isVAOpen)
    }
  }

  const handleCancelPayment = async () => {
    // Your cancel logic here
    
    if(!chargeData) return

    setPaymentStep("failed")
    setIsLoading(false)
    if (chargeData.chargeResponse.actions) {
      const requestCancel =  await fetch("/api/cancel-payment", {
        method:"POST",
        body: JSON.stringify({ transactionId:chargeData.chargeResponse.transaction_id})
      })
      console.log("Payment Canceled:", requestCancel);
    }
    
  };

  async function checkStatus (chargeData:ChargeData) {
      try{
        while (true) {
          const isPending =  await fetch("/api/get-status", {
            method:"POST",
            body: JSON.stringify({ transactionId:chargeData.chargeResponse.transaction_id})
          })
          
          const status = await isPending.json() // assume this returns latest requestData

          console.log("Current status:", status.status.transaction_status);

          if (status.status.transaction_status === "settlement") {
            setPaymentStep("success")
            setIsLoading(false)
            setTimeout(() => {
              onPaymentSuccess()
              onClose()
              resetModal()
            }, 2000)
            break;
          } else if (status.status.transaction_status === "cancel") {
            setShowModal(false)
            break;
          }

          // wait for some time before next check (e.g., 3 seconds)
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        handleCancelPayment()
        console.error("Fetch failed:", error)
      }
      
    }
  // const handleBankSelect = (bank: BankMethod) => {
  //   setSelectedBank(bank)
  // }

  const handlePay = async () => {
    if (!selectedMethod) return
    if (selectedMethod === "virtual_account" && !selectedBank) return
    alert("PAYMENT")
    return
    setIsLoading(true)
    setPaymentStep("processing")
    // Simulate API call
    const response =  await fetch("/api/charge", {
      method:"POST",
      body: JSON.stringify({
        paymentType:selectedMethod,
        selectedBank: selectedBank,
        amount:amount,
      })
    })

    const chargeData = await response.json()
    setChargeData(chargeData)

    console.log(chargeData)
    if (chargeData.chargeResponse.actions) {
        if (selectedMethod === "gopay"){
        if (isMobile) {
          const deeplink = chargeData.chargeResponse.actions[1].url;
          window.location.href = deeplink;
        } else{
          setQrCode(chargeData.chargeResponse.actions[0].url)
          console.log(qrCode)
          setIsLoadingPayment(false)
        }
        checkStatus(chargeData)
        
      } else if (selectedMethod === "qris") {
          setQrCode(chargeData.chargeResponse.actions[0].url)
          setIsLoadingPayment(false)
          console.log(qrCode)
          checkStatus(chargeData)
          
      }
    } else if (chargeData.chargeResponse.va_numbers) {
      if (selectedMethod === "virtual_account" && selectedBank) {
        const vaNumber = `${chargeData.chargeResponse.va_numbers[0].va_number}`
        setVirtualAccountNumber(vaNumber)
        checkStatus(chargeData)

      }
    }

    
    
    

    // await new Promise((resolve) => setTimeout(resolve, 1000))

    // if (selectedMethod === "virtual_account" && selectedBank) {
    //   // Generate virtual account number
    //   if (chargeData.chargeResponse.va_numbers.va_number) {
    //   console.log(chargeData.chargeResponse.va_numbers.va_number)
    // }
    //   const vaNumber = `${chargeData.chargeResponse.va_numbers.va_number}`
    //   setVirtualAccountNumber(vaNumber)
    //   // checkStatus(chargeData)

    //   setPaymentStep("success")
    //   setIsLoading(false)
    //   while (true) {
    //     const isPending =  await fetch("/api/get-status", {
    //       method:"POST",
    //       body: JSON.stringify({ transactionId:chargeData.chargeResponse.transaction_id})
    //     })
        
    //     const status = await isPending.json() // assume this returns latest requestData

    //     console.log("Current status:", status.status.transaction_status);

    //     if (status.status.transaction_status === "settlement") {
    //       break;
    //     }

    //     // wait for some time before next check (e.g., 3 seconds)
    //     await new Promise(resolve => setTimeout(resolve, 3000));
    //   }
    //   onPaymentSuccess()
    //   onClose()
    //   resetModal()
    //   // Simulate waiting for payment (in real app, this would be a webhook or polling)
    //   // setTimeout(() => {
    //   //   setPaymentStep("success")
    //   //   setIsLoading(false)
    //   //   setTimeout(() => {
    //   //     onPaymentSuccess()
    //   //     onClose()
    //   //     resetModal()
    //   //   }, 2000)
    //   // }, 5000) // 5 seconds for demo
    // } else if (selectedMethod === "gopay"){
    //   if (isMobile) {
    //     const deeplink = chargeData.chargeResponse.actions[1].url;
    //     window.location.href = deeplink;
    //   } else{
    //     setQrCode(chargeData.chargeResponse.actions[0].url)
    //     console.log(qrCode)
    //     setIsLoadingPayment(false)
    //   }
    //   // checkStatus(chargeData)
      
    //   while (true) {
    //     const isPending =  await fetch("/api/get-status", {
    //       method:"POST",
    //       body: JSON.stringify({ transactionId:chargeData.chargeResponse.transaction_id})
    //     })
        
    //     const status = await isPending.json() // assume this returns latest requestData
    //     console.log(status)
    //     console.log("Current status:", status.status.transaction_status);

    //     if (status.status.transaction_status === "settlement") {
    //       break;
    //     }

    //     // wait for some time before next check (e.g., 3 seconds)
    //     await new Promise(resolve => setTimeout(resolve, 3000));
    //   }
    //   setPaymentStep("success")
    //   setIsLoading(false)
    //   setTimeout(() => {}, 2000)
    //   onPaymentSuccess()
    //   onClose()
    //   resetModal()
    // } else if (selectedMethod === "qris") {
    //   setQrCode(chargeData.chargeResponse.actions[0].url)
    //   setIsLoadingPayment(false)
    //   console.log(qrCode)
    //   // checkStatus(chargeData)
      
    //   while (true) {
    //     const isPending =  await fetch("/api/get-status", {
    //       method:"POST",
    //       body: JSON.stringify({ transactionId:chargeData.chargeResponse.transaction_id})
    //     })
        
    //     const status = await isPending.json() // assume this returns latest requestData
    //     console.log(status)
    //     console.log("Current status:", status.status.transaction_status);

    //     if (status.status.transaction_status === "settlement") {
    //       break;
    //     }

    //     // wait for some time before next check (e.g., 3 seconds)
    //     await new Promise(resolve => setTimeout(resolve, 3000));
    //   }
      
    //   setPaymentStep("success")
    //   setIsLoading(false)
    //   setTimeout(() => {}, 2000)
    //   onPaymentSuccess()
    //   onClose()
    //   resetModal()
    //   // For GoPay and QRIS, show QR code and wait
    //   // setTimeout(() => {
    //   //   setPaymentStep("success")
    //   //   setIsLoading(false)
    //   //   setTimeout(() => {
    //   //     onPaymentSuccess()
    //   //     onClose()
    //   //     resetModal()
    //   //   }, 2000)
    //   // }, 3000) // 3 seconds for demo
    // }
  }

  const resetModal = () => {
    setSelectedMethod(null)
    setSelectedBank(null)
    setPaymentStep("select")
    setIsLoading(false)
    setVirtualAccountNumber("")
    setIsVAOpen(false)
    setCopied(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(resetModal, 300) // Reset after modal closes
  }

  const renderPaymentStep = () => {
    if (paymentStep === "select") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">
                  {processingType === "generate_shorts" ? "Shorts Generation Service" : "Video Processing Service"}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {processingType === "generate_shorts"
                    ? "AI-powered short clips generation"
                    : "Professional video editing"}
                </p>
              </div>
              <span className="text-2xl font-bold">Rp{(amount).toLocaleString()}K</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Select Payment Method</h4>

            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
                className={cn(
                  "w-full p-3 border-2 rounded-lg transition-all hover:shadow-md flex items-center gap-3",
                  selectedMethod === method.id && selectedMethod !== "virtual_account"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-gray-200 hover:border-primary/50",
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", method.color)}>
                  <Image src={`${method.icon}`} alt=""/>
                </div>
                <p className="font-medium">{method.name}</p>
              </button>
            ))}

            {/* Virtual Account Dropdown */}
            <div className="space-y-2">
              <button
                onClick={() => handlePaymentMethodSelect("virtual_account")}
                className={cn(
                  "w-full p-3 border-2 rounded-lg transition-all hover:shadow-md flex items-center gap-3",
                  selectedMethod === "virtual_account"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-gray-200 hover:border-primary/50",
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <p className="font-medium">Transfer Virtual Account</p>
                <div className="ml-auto">
                  {isVAOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isVAOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="mt-4 grid grid-cols-3 gap-4">
                      {banks.map((bank) => (
                        <button
                          key={bank.name}
                          onClick={() => setSelectedBank(bank.id as BankMethod)}
                          className={`flex flex-col items-center p-1 rounded-lg transition-all text-xs border-1 ${
                            selectedBank === bank.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-gray-200 hover:border-primary/50"
                          }`}
                        >
                          <Image src={bank.logo} alt={bank.name} className="h-5 mb-0.5" />
                          <span className="text-xs">{bank.name}</span>
                        </button>
                      ))}
                    </div>
              </div>
{/*               
                  {isVAOpen && (
                    
                  )}
               */}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={!selectedMethod || (selectedMethod === "virtual_account" && !selectedBank) || isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay Rp${(amount).toLocaleString()}K`
              )}
            </Button>
          </div>
        </div>
      )
    }

    if (paymentStep === "processing") {
      const isVirtualAccount = selectedMethod === "virtual_account"
      const isQRMethod =  selectedMethod === "qris"
      const isGopay = selectedMethod === "gopay"

      return (
        <div className="space-y-6 text-center">
          {isQRMethod && (
            <>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Scan QR Code</h3>
              </div>

              {/* Mock QR Code */}
              <div className="w-64 h-64 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <div className="bg-black rounded-lg flex items-center justify-center">
                  
                    {isLoadingPayment ? (
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                      
                    ) : <Image
                      src={`/api/get-qrcode?link=${qrCode}`}
                      alt="QR Code"
                      className="w-full h-full"
                    />}
                    
                </div>
              </div>

              <div className="m-0">
                <p className="text-sm text-muted-foreground">Amount to pay</p>
                <p className="text-2xl font-bold">Rp {(amount * 15000).toLocaleString()}</p>
              </div>
            </>
          )}

          {isGopay && (
            <>
               <div className="space-y-4">
                  <h3 className="text-xl font-semibold"> 
                    `${isMobile ? "Redirect to Gopay app": "Scan QR Code"}`
                  </h3>
                </div>
            </>
          )}

          {isVirtualAccount && (
            <>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Virtual Account Created</h3>
                <p className="text-muted-foreground">Transfer the exact amount to the virtual account number below</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    {selectedBank?.toUpperCase()} Virtual Account Number
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-lg font-mono bg-white p-3 rounded border">{virtualAccountNumber}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(virtualAccountNumber)}
                      className="bg-transparent"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Amount</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-lg font-mono bg-white p-3 rounded border">
                      Rp {(amount * 15000).toLocaleString()}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard((amount * 15000).toString())}
                      className="bg-transparent"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Transfer the exact amount shown above</p>
                  <p>• Payment will be confirmed automatically</p>
                  <p>• Do not close this window until payment is complete</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Waiting for payment confirmation...</span>
              </div>
            </>
          )}
          <div className="flex w-full h-12 items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isVirtualAccount ? "Waiting for Transfer..." : "Waiting for Payment..."} 
          </div> 

          <Button variant="outline" onClick={() => setShowModal(true)} className="flex-1 bg-transparent">
              Cancel
          </Button>

          <ConfirmModal
            open={showModal}
            onOpenChange={setShowModal}
            title="Cancel Payment?"
            description="Are you sure you want to cancel this payment? This action is permanent."
            onConfirm={handleCancelPayment}
          />
        </div>
      )
    }

    if (paymentStep === "success") {
      return (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground">Your payment has been confirmed. Processing will begin shortly.</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              Amount paid: <span className="font-semibold">Rp {(amount * 15000).toLocaleString()}</span>
            </p>
          </div>
        </div>
      )
    }

    if (paymentStep === "failed") {
      return (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <CircleX className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-red-600">Payment Failed!</h3>
            <p className="text-muted-foreground">Your payment failed. Back to homescreen.</p>
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Ok
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💳</span>
            </div>
            {paymentStep === "select" && "Choose Payment Method"}
            {paymentStep === "processing" && "Complete Payment"}
            {paymentStep === "success" && "Payment Confirmed"}
          </DialogTitle>
          <DialogDescription>
            {paymentStep === "select" && "Select your preferred payment method to continue"}
            {paymentStep === "processing" && "Follow the instructions below to complete your payment"}
            {paymentStep === "success" && "Thank you for your payment"}
          </DialogDescription>
        </DialogHeader>

        {renderPaymentStep()}
      </DialogContent>
    </Dialog>
  )
}
