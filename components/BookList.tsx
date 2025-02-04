import React from "react";
import BookCard from "./BookCard";

interface Props {
  title: string;
  books: Book[];
  containerClassName?: string;
  isProfilePage?: boolean;
}

const BookList = ({
  title,
  books,
  containerClassName,
  isProfilePage = false,
}: Props) => {
  if (!isProfilePage && books.length < 2) return;

  return (
    <section className={containerClassName}>
      <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>(
      <ul className="book-list">
        {books.map((book) => {
          book.isLoanedBook = isProfilePage;
          return <BookCard key={book.title} {...book} />;
        })}
      </ul>
      )
    </section>
  );
};

export default BookList;
