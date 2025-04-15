import React, { useState, useEffect } from "react";
import {
  NavBar,
  Button,
  Form,
  Cell,
  DatePicker,
  Dialog,
  type PickerOption,
} from "@nutui/nutui-react";
import { Close, ArrowLeft } from "@nutui/icons-react";
import faction from "../css/faction.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import userService from "../axios/userService";

interface FactionFormData {
  hazardConfirmation: string;
  hazardType: string;
  hazardLevel: string;
  hazardDescription: string;
  responsiblePerson: string;
  deadline: string;
  ccPerson: string;
  handleSuggestion: string;
}

interface LocationState {
  id: string;
  type?: string;
  place?: string;
  detail?: string;
}

const Faction: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [hiddenId, setHiddenId] = useState<string>("");
  const [formData, setFormData] = useState<FactionFormData>({
    hazardConfirmation: "",
    hazardType: "",
    hazardLevel: "一般隐患",
    hazardDescription: "",
    responsiblePerson: "",
    deadline: "",
    ccPerson: "",
    handleSuggestion: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.id) {
      setHiddenId(state.id);
      setFormData(prev => ({
        ...prev,
        hazardType: state.type || "校园第三方建筑",
        hazardDescription: state.detail || "",
      }));
    } else {
      Dialog.alert({
        title: "错误",
        content: "缺少隐患ID，请返回重试",
        onConfirm: () => {
          nav(-1);
        },
      });
    }
  }, [location.state, nav]);

  const handleInputChange = (field: keyof FactionFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      deadline: value
    }));
  };

  const handleDelete = async () => {
    try {
      if (!hiddenId) {
        throw new Error('缺少隐患ID，请返回重试');
      }

      try {
        // 使用userService进行调用，为了符合ProcessHazardData类型，需要提供所有必填字段
        const data = await userService.processHazard(hiddenId, {
          responsiblePerson: "系统",
          deadline: new Date().toISOString().split('T')[0],
          ccPerson: "",
          state: "0" // 删除/取消状态
        });
        
        Dialog.alert({
          title: "提示",
          content: data.message || "删除成功",
          onConfirm: () => {
            nav('/Check');
          },
        });
      } catch (error) {
        console.error('删除失败:', error);
        Dialog.alert({
          title: "错误",
          content: error instanceof Error ? error.message : "删除失败，请重试",
        });
      }
    } catch (error) {
      console.error('删除失败:', error);
      Dialog.alert({
        title: "错误",
        content: error instanceof Error ? error.message : "删除失败，请重试",
      });
    }
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.hazardConfirmation) {
      return Dialog.alert({
        title: "提示",
        content: "请选择隐患确认",
      });
    }

    // 如果是非隐患或重复上报，直接显示删除确认对话框
    if (formData.hazardConfirmation === "非隐患" || formData.hazardConfirmation === "重复上报") {
      setShowDeleteDialog(true);
      return;
    }

    if (formData.hazardConfirmation === "是隐患") {
      if (!formData.responsiblePerson) {
        return Dialog.alert({
          title: "提示",
          content: "请选择处理负责人",
        });
      }
      if (!formData.deadline) {
        return Dialog.alert({
          title: "提示",
          content: "请选择处理期限",
        });
      }

      try {
        if (!hiddenId) {
          throw new Error('缺少隐患ID，请返回重试');
        }

        // 使用userService进行调用
        const data = await userService.processHazard(hiddenId, {
          responsiblePerson: formData.responsiblePerson,
          deadline: formData.deadline,
          ccPerson: formData.ccPerson,
          handleSuggestion: formData.handleSuggestion || "",
          state: "2", // 更新为处理中状态
        });
        
        Dialog.alert({
          title: "提示",
          content: data.message || "更新成功",
          onConfirm: () => {
            nav('/Check');
          },
        });
      } catch (error) {
        console.error('更新失败:', error);
        Dialog.alert({
          title: "错误",
          content: error instanceof Error ? error.message : "操作失败，请重试",
        });
      }
    }
  };

  return (
    <div className={faction.container}>
      <div className={faction.aaaa}>
        <NavBar
          className={faction.navbar}
          left={<Close />}
          back={<ArrowLeft />}
          onBackClick={() => nav(-1)}
        >
          详情
        </NavBar>
      </div>

      <Form className={faction.form}>
        <div className={faction.section}>
          <h3 className={faction.sectionTitle}>隐患确认信息</h3>

          <div className={faction.formGroup}>
            <label>隐患确认</label>
            <div className={faction.radioGroup}>
              {["是隐患", "非隐患", "重复上报"].map((option) => (
                <label key={option} className={faction.radioLabel}>
                  <input
                    type="radio"
                    name="hazardConfirmation"
                    value={option}
                    checked={formData.hazardConfirmation === option}
                    onChange={(e) =>
                      handleInputChange("hazardConfirmation", e.target.value)
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className={faction.formGroup}>
            <label>隐患类型</label>
            <span className={faction.value}>校园食品安全</span>
          </div>

          <div className={faction.formGroup}>
            <label>隐患级别</label>
            <span className={faction.value}>{formData.hazardLevel}</span>
          </div>

          <div className={faction.formGroup}>
            <label>隐患描述</label>
            <textarea
              value={formData.hazardDescription}
              onChange={(e) =>
                handleInputChange("hazardDescription", e.target.value)
              }
              className={faction.textarea}
              rows={3}
            />
          </div>
        </div>

        {formData.hazardConfirmation === "是隐患" && (
          <div className={faction.section}>
            <h3 className={faction.sectionTitle}>派指人员</h3>

            <div className={faction.formGroup}>
              <label>处理负责人</label>
              <select
                value={formData.responsiblePerson}
                onChange={(e) =>
                  handleInputChange("responsiblePerson", e.target.value)
                }
                className={faction.select}
              >
                <option value="">请选择</option>
                <option value="李工">李工</option>
                <option value="王工">王工</option>
              </select>
            </div>

            <div className={faction.formGroup}>
              <label>处理期限</label>
              <Cell
                className={faction.dateCell}
                title={formData.deadline || "请选择日期"}
                onClick={() => setShowDatePicker(true)}
              />
              <DatePicker
                title="选择日期"
                visible={showDatePicker}
                showChinese
                type="date"
                defaultValue={new Date()}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(selectedOptions: PickerOption[], selectedValue: (string | number)[]) => {
                  const selectedDate = `${selectedValue[0]}-${String(selectedValue[1]).padStart(2, '0')}-${String(selectedValue[2]).padStart(2, '0')}`;
                  handleDateChange(selectedDate);
                  setShowDatePicker(false);
                }}
              />
            </div>

            <div className={faction.formGroup}>
              <label>抄送人</label>
              <select
                value={formData.ccPerson}
                onChange={(e) => handleInputChange("ccPerson", e.target.value)}
                className={faction.select}
              >
                <option value="">请选择</option>
                <option value="李总">李总</option>
                <option value="王总">王总</option>
              </select>
            </div>

            <div className={faction.formGroup}>
              <label>处理意见</label>
              <textarea
                value={formData.handleSuggestion}
                onChange={(e) =>
                  handleInputChange("handleSuggestion", e.target.value)
                }
                className={faction.textarea}
                rows={8}
              />
            </div>
          </div>
        )}
      </Form>

      <div className={faction.footer}>
        <Button className={faction.cancelButton} onClick={() => nav(-1)}>
          取消
        </Button>
        <Button className={faction.submitButton} onClick={handleSubmit}>
          确定
        </Button>
      </div>

      <Dialog
        title="提示"
        visible={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      >
        是否删除该隐患？
      </Dialog>
    </div>
  );
};

export default Faction;
