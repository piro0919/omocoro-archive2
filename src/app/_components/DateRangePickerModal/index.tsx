import { format } from "date-fns";
import { parseAsString, useQueryState } from "nuqs";
import { type JSX, useEffect, useRef, useState } from "react";
import { DateRangePicker, type Range } from "react-date-range";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as locales from "react-date-range/dist/locale";
import Modal from "react-modal";
import { useOnClickOutside } from "usehooks-ts";
import styles from "./style.module.css";

export type DateRangePickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DateRangePickerModal({
  isOpen,
  onClose,
}: DateRangePickerModalProps): JSX.Element {
  const [from, setFrom] = useQueryState(
    "from",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const [to, setTo] = useQueryState(
    "to",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const [range, setRange] = useState<Range>({
    endDate: to ? new Date(to) : new Date(),
    key: "range",
    startDate: from ? new Date(from) : new Date(),
  });
  const ref = useRef<HTMLDivElement>(null);

  // @ts-expect-error: useOnClickOutside does not support ref type
  useOnClickOutside(ref, () => {
    onClose();
  });

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  return (
    <Modal
      className={styles.content}
      isOpen={isOpen}
      overlayClassName={styles.overlay}
    >
      <div className={styles.inner} ref={ref}>
        <DateRangePicker
          onChange={({ range }) => {
            setRange(range);
          }}
          className={styles.dateRangePicker}
          dateDisplayFormat="yyyy年MM月dd日"
          locale={locales.ja.ja}
          maxDate={new Date()}
          minDate={new Date("2005-10-19")}
          ranges={[range]}
        />
        <button
          onClick={() => {
            setFrom(
              range.startDate ? format(range.startDate, "yyyy-MM-dd") : null,
            );
            setTo(range.endDate ? format(range.endDate, "yyyy-MM-dd") : null);

            onClose();
          }}
          className={styles.button}
        >
          検索する
        </button>
      </div>
    </Modal>
  );
}
