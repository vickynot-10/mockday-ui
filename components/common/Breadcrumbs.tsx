
export type BreadCrumbProps = {
  href?: string;
  label: string;
};

interface BreadCrumbItems {
  items: BreadCrumbProps[];
}

export default function BreadCrumbs({ items }: BreadCrumbItems) {
  if (items.length === 1) {
    return (
      <h1 className=" text-2xl  my-5  leading-0.5   font-bold">
        {" "}
        {items[0].label}.{" "}
      </h1>
    );
  }
  return <></>
}
