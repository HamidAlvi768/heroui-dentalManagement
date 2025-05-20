<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "patient_appointments".
 *
 * @property int $id
 * @property int $patient_id
 * @property int|null $scheduled_by
 * @property string $appointment_date
 * @property string|null $appointment_reason
 * @property string $status
 * @property string|null $notes
 * @property string $created_at
 * @property string $updated_at
 */
class PatientAppointments extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'patient_appointments';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['patient_id', 'appointment_date'], 'required'],
            [['patient_id', 'scheduled_by'], 'integer'],
            [['appointment_date', 'created_at', 'updated_at'], 'safe'],
            [['appointment_reason', 'status', 'notes'], 'string'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'patient_id' => 'Patient ID',
            'scheduled_by' => 'Scheduled By',
            'appointment_date' => 'Appointment Date',
            'appointment_reason' => 'Appointment Reason',
            'status' => 'Status',
            'notes' => 'Notes',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * {@inheritdoc}
     * @return PatientAppointmentsQuery the active query used by this AR class.
     */
    public static function find()
    {
        return new PatientAppointmentsQuery(get_called_class());
    }
    public function getPatient()
    {
        return $this->hasOne(Patients::class, ['id' => 'patient_id']);
    }
}
