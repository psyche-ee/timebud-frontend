export default function Records({ records, rate }: any) {

  if (!records) return null;

  return (
    <div className="space-y-2">

      <h3 className="text-secondary font-medium">
        Recent Records
      </h3>

      {records.map((rec: any) => {

        const date = new Date(rec.time_in).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric"
        });

        const hrs = rec.total_hrs;
        const income = (hrs * rate).toFixed(2);

        return (
          <div
            key={rec.id}
            className="bg-surface rounded-xl p-4 flex justify-between"
          >

            <div>
              <p className="font-medium text-secondary">{date}</p>
              <p className="text-gray-custom text-sm">{hrs}hrs</p>
            </div>

            <p className="text-primary font-semibold text-lg">
              ₱{income}
            </p>

          </div>
        );

      })}
    </div>
  );
}