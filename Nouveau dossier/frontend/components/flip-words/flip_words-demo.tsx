import { FlipWords } from "./flip-words"

export function FlipWordsDemo() {
  const words = ["thrilling", "adventurous", "exciting", "unforgettable"]

  return (
    <div className=" pt-[3rem] flex justify-center items-center px-4">
      <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400 text-center">
        Experience
        <FlipWords words={words} /> <br />
        moments at Forest Adventure Annaba!
      </div>
    </div>
  )
}
