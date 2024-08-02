/* eslint-disable no-unused-vars */
import { vnp_HashSecret, vnp_ReturnUrl, vnp_TmnCode } from '@/constants/env'
import { HttpStatusCode } from '@/constants/httpStatusCode.enum'
import crypto from 'crypto'
import { Request, Response } from 'express'
import moment from 'moment'
import QueryString from 'qs'

export const createPaymentUrl = async (req: Request, res: Response, next: any) => {
  try {
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress

    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')

    let vnpUrl = process.env.vnp_Url
    const orderId = moment(date).format('DDHHmmss')

    const amount = req.body.amount

    const orderInfo = req.body.orderDescription
    const orderType = req.body.orderType

    const currCode = 'VND'
    let vnp_Params: {
      [key: string]: string | string[] | number
    } = {}

    vnp_Params['vnp_Version'] = '2.1.0'
    vnp_Params['vnp_Command'] = 'pay'
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode
    vnp_Params['vnp_Locale'] = 'vn'
    vnp_Params['vnp_CurrCode'] = currCode
    vnp_Params['vnp_TxnRef'] = orderId
    vnp_Params['vnp_OrderInfo'] = orderInfo
    vnp_Params['vnp_OrderType'] = orderType
    vnp_Params['vnp_Amount'] = amount * 100
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl
    vnp_Params['vnp_IpAddr'] = ipAddr || ''
    vnp_Params['vnp_CreateDate'] = createDate

    vnp_Params = sortObject(vnp_Params)

    const signData = QueryString.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', vnp_HashSecret)
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')
    vnp_Params['vnp_SecureHash'] = signed
    vnpUrl += '?' + QueryString.stringify(vnp_Params, { encode: false })

    // res.redirect(vnpUrl)
    res.status(HttpStatusCode.Ok).json(vnpUrl)
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json(error)
  }
}

export const vnpayIpn = (req: Request, res: Response, next: any) => {
  let vnp_Params = req.query
  const secureHash = vnp_Params['vnp_SecureHash']
  const orderId = vnp_Params['vnp_TxnRef']
  const rspCode = vnp_Params['vnp_ResponseCode']

  delete vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHashType']

  vnp_Params = sortObject(vnp_Params)

  const signData = QueryString.stringify(vnp_Params, { encode: false })
  const hmac = crypto.createHmac('sha512', vnp_HashSecret)
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')

  let paymentStatus = '0' // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
  //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
  //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

  let checkOrderId = true // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
  let checkAmount = true // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
  if (secureHash === signed) {
    //kiểm tra checksum
    if (checkOrderId) {
      if (checkAmount) {
        if (paymentStatus == '0') {
          //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
          if (rspCode == '00') {
            //thanh cong
            //paymentStatus = '1'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
            res.status(HttpStatusCode.Ok).json({ RspCode: '00', Message: 'Success' })
          } else {
            //that bai
            //paymentStatus = '2'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
            res.status(HttpStatusCode.Ok).json({ RspCode: '00', Message: 'Success' })
          }
        } else {
          res
            .status(HttpStatusCode.Ok)
            .json({ RspCode: '02', Message: 'This order has been updated to the payment status' })
        }
      } else {
        res.status(HttpStatusCode.Ok).json({ RspCode: '04', Message: 'Amount invalid' })
      }
    } else {
      res.status(HttpStatusCode.Ok).json({ RspCode: '01', Message: 'Order not found' })
    }
  } else {
    res.status(HttpStatusCode.Ok).json({ RspCode: '97', Message: 'Checksum failed' })
  }
}

export const vnpayReturn = (req: Request, res: Response, next: any) => {
  let vnp_Params = req.query

  const secureHash = vnp_Params['vnp_SecureHash']
  const paymentId = vnp_Params['vnp_TxnRef']
  const orderId = vnp_Params['vnp_OrderInfo']

  delete vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHashType']

  vnp_Params = sortObject(vnp_Params)
  const signData = QueryString.stringify(vnp_Params, { encode: false })
  const hmac = crypto.createHmac('sha512', vnp_HashSecret)
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
    res.status(HttpStatusCode.Ok).json({ code: vnp_Params['vnp_ResponseCode'], orderId, paymentId })
  } else {
    res.json({ code: '97' })
  }
}

// export const querydr = (req, res, next) => {
//   const date = new Date()

//   const vnp_TmnCode = process.env.vnp_TmnCode
//   const secretKey = process.env.vnp_HashSecret
//   const vnp_Api = process.env.vnp_Api

//   let vnp_TxnRef = req.body.orderId
//   let vnp_TransactionDate = req.body.transDate

//   let vnp_RequestId = moment(date).format('HHmmss')
//   let vnp_Version = '2.1.0'
//   let vnp_Command = 'querydr'
//   let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef

//   let vnp_IpAddr =
//     req.headers['x-forwarded-for'] ||
//     req.connection.remoteAddress ||
//     req.socket.remoteAddress ||
//     req.connection.socket.remoteAddress

//   let currCode = 'VND'
//   let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss')

//   let data =
//     vnp_RequestId +
//     '|' +
//     vnp_Version +
//     '|' +
//     vnp_Command +
//     '|' +
//     vnp_TmnCode +
//     '|' +
//     vnp_TxnRef +
//     '|' +
//     vnp_TransactionDate +
//     '|' +
//     vnp_CreateDate +
//     '|' +
//     vnp_IpAddr +
//     '|' +
//     vnp_OrderInfo

//   let hmac = crypto.createHmac('sha512', secretKey)
//   let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest('hex')

//   let dataObj = {
//     vnp_RequestId: vnp_RequestId,
//     vnp_Version: vnp_Version,
//     vnp_Command: vnp_Command,
//     vnp_TmnCode: vnp_TmnCode,
//     vnp_TxnRef: vnp_TxnRef,
//     vnp_OrderInfo: vnp_OrderInfo,
//     vnp_TransactionDate: vnp_TransactionDate,
//     vnp_CreateDate: vnp_CreateDate,
//     vnp_IpAddr: vnp_IpAddr,
//     vnp_SecureHash: vnp_SecureHash,
//   }
//   // /merchant_webapi/api/transaction
//   request(
//     {
//       url: vnp_Api,
//       method: 'POST',
//       json: true,
//       body: dataObj,
//     },
//     function (error, response, body) {
//       console.log(response)
//     },
//     res.json(response),
//   )
// }

// export const refund = (req, res, next) => {
//   const date = new Date()

//   const vnp_TmnCode = process.env.vnp_TmnCode
//   const secretKey = process.env.vnp_HashSecret
//   const vnp_Api = process.env.vnp_Api

//   let vnp_TxnRef = req.body.orderId
//   let vnp_TransactionDate = req.body.transDate
//   let vnp_Amount = req.body.amount * 100
//   let vnp_TransactionType = req.body.transType
//   let vnp_CreateBy = req.body.user

//   let currCode = 'VND'

//   let vnp_RequestId = moment(date).format('HHmmss')
//   let vnp_Version = '2.1.0'
//   let vnp_Command = 'refund'
//   let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef

//   let vnp_IpAddr =
//     req.headers['x-forwarded-for'] ||
//     req.connection.remoteAddress ||
//     req.socket.remoteAddress ||
//     req.connection.socket.remoteAddress

//   let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss')

//   let vnp_TransactionNo = '0'

//   let data =
//     vnp_RequestId +
//     '|' +
//     vnp_Version +
//     '|' +
//     vnp_Command +
//     '|' +
//     vnp_TmnCode +
//     '|' +
//     vnp_TransactionType +
//     '|' +
//     vnp_TxnRef +
//     '|' +
//     vnp_Amount +
//     '|' +
//     vnp_TransactionNo +
//     '|' +
//     vnp_TransactionDate +
//     '|' +
//     vnp_CreateBy +
//     '|' +
//     vnp_CreateDate +
//     '|' +
//     vnp_IpAddr +
//     '|' +
//     vnp_OrderInfo
//   let hmac = crypto.createHmac('sha512', secretKey)
//   let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest('hex')

//   let dataObj = {
//     vnp_RequestId: vnp_RequestId,
//     vnp_Version: vnp_Version,
//     vnp_Command: vnp_Command,
//     vnp_TmnCode: vnp_TmnCode,
//     vnp_TransactionType: vnp_TransactionType,
//     vnp_TxnRef: vnp_TxnRef,
//     vnp_Amount: vnp_Amount,
//     vnp_TransactionNo: vnp_TransactionNo,
//     vnp_CreateBy: vnp_CreateBy,
//     vnp_OrderInfo: vnp_OrderInfo,
//     vnp_TransactionDate: vnp_TransactionDate,
//     vnp_CreateDate: vnp_CreateDate,
//     vnp_IpAddr: vnp_IpAddr,
//     vnp_SecureHash: vnp_SecureHash,
//   }

//   request(
//     {
//       url: vnp_Api,
//       method: 'POST',
//       json: true,
//       body: dataObj,
//     },
//     function (error, response, body) {
//       console.log(response)
//     },
//   )
// }

const sortObject = (obj: any) => {
  const sorted: { [key: string]: string } = {}
  const str = []
  let key
  for (key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key))
    }
  }
  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
  }
  return sorted
}
