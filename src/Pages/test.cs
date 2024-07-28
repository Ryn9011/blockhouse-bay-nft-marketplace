using System;
using System.IO;

#nullable disable
namespace Booster.CodingTest.Library
{
public class WordStream : Stream
{
private readonly IWordStreamWriter _wordStreamWriter;


public WordStream() => this._wordStreamWriter = (IWordStreamWriter) new WordStreamWriter();

public virtual bool CanRead => true;

public virtual bool CanSeek => false;

public virtual bool CanWrite => false;

public virtual void Flush() => throw new NotSupportedException();

public virtual long Length => throw new NotSupportedException();

public virtual long Position
{
  get => throw new NotSupportedException();
  set => throw new NotSupportedException();
}

public virtual int Read(byte[] buffer, int offset, int count)
{
  byte[] buffer1 = new byte[count];
  this._wordStreamWriter.Read(buffer1, count);
  buffer1.CopyTo((Array) buffer, offset);
  return count;
}

public virtual long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

public virtual void SetLength(long value) => throw new NotSupportedException();

public virtual void Write(byte[] buffer, int offset, int count)
{
  throw new NotSupportedException();
}