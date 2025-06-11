<?php

namespace app\controllers\api;

use app\components\Helper;
use app\models\Invoices;
use app\models\InvoiceItems;
use Yii;
use yii\rest\Controller;
use yii\web\Response;
use yii\web\UnauthorizedHttpException;
use app\models\User;
use yii\filters\Cors;

class InvoiceController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => Helper::ApiAllowedOrigins(),
                'Access-Control-Allow-Methods' => ['POST', 'GET', 'OPTIONS'],
                'Access-Control-Allow-Headers' => ['Content-Type', 'Authorization'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
            ],
        ];

        $behaviors['contentNegotiator']['formats']['application/json'] = Response::FORMAT_JSON;

        return $behaviors;
    }

    public function actions()
    {
        return [
            'options' => [
                'class' => 'yii\rest\OptionsAction',
            ],
        ];
    }

    public function actionCreate()
    {
        if (Yii::$app->request->isPost) {
            $request = json_decode(Yii::$app->request->rawBody, true);

            $token = Yii::$app->request->headers->get('Authorization');
            $token = str_replace('Bearer ', '', $token);

            $user = User::findOne(['access_token' => $token]);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid token',
                ];
            }

            $transaction = Yii::$app->db->beginTransaction();
            try {
                $invoice = new Invoices();
                $invoice->patient_id = $request['patient_id'];
                $invoice->doctor_id = $request['doctor_id'];
                $invoice->issued_by = $user->id;
                $invoice->invoice_number = $request['invoice_number'];
                $invoice->invoice_date = $request['invoice_date'];
                $invoice->total_amount = $request['total_amount'];
                $invoice->discount_amount = $request['discount_amount'] ?? 0;
                $invoice->net_amount = $request['net_amount'];
                $invoice->paid = $request['paid'] ?? 0;
                $invoice->payment_method = $request['payment_method'] ?? null;
                $invoice->notes = $request['notes'] ?? null;

                if (!$invoice->save()) {
                    throw new \Exception('Failed to save invoice');
                }

                // Save invoice items
                if (isset($request['items']) && is_array($request['items'])) {
                    foreach ($request['items'] as $item) {
                        $invoiceItem = new InvoiceItems();
                        $invoiceItem->invoice_id = $invoice->id;
                        $invoiceItem->item_type = $item['item_type'];
                        $invoiceItem->item_description = $item['item_description'];
                        $invoiceItem->quantity = $item['quantity'];
                        $invoiceItem->unit_price = $item['unit_price'];
                        $invoiceItem->discount = $item['discount'] ?? 0;
                        $invoiceItem->total_price = $item['total_price'];

                        if (!$invoiceItem->save()) {
                            throw new \Exception('Failed to save invoice item');
                        }
                    }
                }

                $transaction->commit();

                return [
                    'success' => true,
                    'message' => 'Invoice created successfully',
                    'invoice' => $invoice,
                ];
            } catch (\Exception $e) {
                $transaction->rollBack();
                return [
                    'success' => false,
                    'message' => 'Something went wrong!',
                    'error' => $e->getMessage(),
                ];
            }
        } else {
            return [
                'success' => false,
                'message' => 'Method is not correct!',
            ];
        }
    }

    public function actionEdit($id)
    {
        if (Yii::$app->request->isPost) {
            $request = json_decode(Yii::$app->request->rawBody, true);

            $token = Yii::$app->request->headers->get('Authorization');
            $token = str_replace('Bearer ', '', $token);

            $user = User::findOne(['access_token' => $token]);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid token',
                ];
            }

            $transaction = Yii::$app->db->beginTransaction();
            try {
                $invoice = Invoices::findOne($id);
                if (!$invoice) {
                    throw new \Exception('Invoice not found');
                }

                $invoice->invoice_date = $request['invoice_date'];
                $invoice->total_amount = $request['total_amount'];
                $invoice->discount_amount = $request['discount_amount'] ?? 0;
                $invoice->net_amount = $request['net_amount'];
                $invoice->paid = $request['paid'] ?? 0;
                $invoice->payment_method = $request['payment_method'] ?? null;
                $invoice->notes = $request['notes'] ?? null;

                if (!$invoice->save()) {
                    throw new \Exception('Failed to update invoice');
                }

                // Update invoice items
                if (isset($request['items']) && is_array($request['items'])) {
                    // Delete existing items
                    InvoiceItems::deleteAll(['invoice_id' => $invoice->id]);

                    // Add new items
                    foreach ($request['items'] as $item) {
                        $invoiceItem = new InvoiceItems();
                        $invoiceItem->invoice_id = $invoice->id;
                        $invoiceItem->item_type = $item['item_type'];
                        $invoiceItem->item_description = $item['item_description'];
                        $invoiceItem->quantity = $item['quantity'];
                        $invoiceItem->unit_price = $item['unit_price'];
                        $invoiceItem->discount = $item['discount'] ?? 0;
                        $invoiceItem->total_price = $item['total_price'];

                        if (!$invoiceItem->save()) {
                            throw new \Exception('Failed to save invoice item');
                        }
                    }
                }

                $transaction->commit();

                return [
                    'success' => true,
                    'message' => 'Invoice updated successfully',
                    'invoice' => $invoice,
                ];
            } catch (\Exception $e) {
                $transaction->rollBack();
                return [
                    'success' => false,
                    'message' => 'Something went wrong!',
                    'error' => $e->getMessage(),
                ];
            }
        } else {
            return [
                'success' => false,
                'message' => 'Method is not correct!',
            ];
        }
    }

    public function actionDelete()
    {
        if (Yii::$app->request->isPost) {
            $request = json_decode(Yii::$app->request->rawBody, true);

            $token = Yii::$app->request->headers->get('Authorization');
            $token = str_replace('Bearer ', '', $token);

            $user = User::findOne(['access_token' => $token]);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid token',
                ];
            }

            $transaction = Yii::$app->db->beginTransaction();
            try {
                $invoice = Invoices::findOne($request['id']);
                if (!$invoice) {
                    throw new \Exception('Invoice not found');
                }

                // Delete associated items first
                InvoiceItems::deleteAll(['invoice_id' => $invoice->id]);

                if (!$invoice->delete()) {
                    throw new \Exception('Failed to delete invoice');
                }

                $transaction->commit();

                return [
                    'success' => true,
                    'message' => 'Invoice deleted successfully',
                ];
            } catch (\Exception $e) {
                $transaction->rollBack();
                return [
                    'success' => false,
                    'message' => 'Something went wrong!',
                    'error' => $e->getMessage(),
                ];
            }
        } else {
            return [
                'success' => false,
                'message' => 'Method is not correct!',
            ];
        }
    }

    public function actionList()
    {
        $token = Yii::$app->request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        $user = User::findOne(['access_token' => $token]);
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Invalid token',
            ];
        }

        // Read query parameters from frontend
        $request = Yii::$app->request;
        $page = (int)$request->get('page', 1);
        $perpage = (int)$request->get('perpage', 5);
        $sort = $request->get('sort', 'created_at');
        $order = strtolower($request->get('order', 'desc')) === 'desc' ? SORT_DESC : SORT_ASC;

        // Build query
        $query = Invoices::find()->with(['patient', 'doctor']);

        // Apply filters if provided
        $patient_id = $request->get('patient_id', '');
        if (!empty($patient_id)) {
            $query->andWhere(['patient_id' => $patient_id]);
        }

        $invoice_number = $request->get('invoice_number', '');
        if (!empty($invoice_number)) {
            $query->andWhere(['like', 'invoice_number', $invoice_number]);
        }

        $paid = $request->get('paid', '');
        if ($paid !== '') {
            $query->andWhere(['paid' => $paid]);
        }

        $total = $query->count();

        $data = $query
            ->with('items') // Eager load invoice items
            ->orderBy([$sort => $order])
            ->offset(($page - 1) * $perpage)
            ->limit($perpage)
            ->asArray()
            ->all();

        $data = array_map(function($value) {
            $value['due_amount'] = ($value['total_amount'] - ($value['discount_amount']??0)) - $value['paid'];
            //total (not due but total) amount after discount (total amount minus discount amount)
            $value['after_discount'] = $value['total_amount'] - $value['discount_amount'];
            return $value;
        }, $data);

        return [
            'success' => true,
            'message' => 'Data fetched successfully',
            'data' => $data,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'perpage' => $perpage
            ]
        ];
    }
}
